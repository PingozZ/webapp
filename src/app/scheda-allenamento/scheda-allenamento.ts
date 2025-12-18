import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import html2pdf from 'html2pdf.js';





@Component({
  selector: 'app-scheda-allenamento',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    HttpClientModule,
    CommonModule,
  ],
  templateUrl: './scheda-allenamento.html',
  styleUrls: ['./scheda-allenamento.scss'],
})
export class SchedaAllenamento {
  // Campi del form
  nome: string = '';
  sesso: string = '';
  eta: number | null = null;
  peso: number | null = null;
  altezza: number | null = null;
  obiettivi: string[] = [];
  livello: string = '';
  giorni: string = '';
  restrizioni: string = '';

  // Variabile per mostrare la risposta di n8n
  risultatoN8n: string | null = null;

  private apiUrl = 'http://localhost:8080/webhook/personal-trainer';

  constructor(private http: HttpClient) { }

  inviaScheda() {
    const data = {
      nome: this.nome,
      sesso: this.sesso,
      eta: this.eta,
      peso: this.peso,
      altezza: this.altezza,
      obiettivi: this.obiettivi,
      livello: this.livello,
      giorni: this.giorni,
      restrizioni: this.restrizioni
    };
  }

  // ✅ Esporta in PDF

  async esportaPDF() {
    if (!this.risultatoN8n) return;

    // 🔹 Lazy load (riduce bundle + warning)
    const html2pdf = (await import('html2pdf.js')).default;

    // 🔹 Contenitore temporaneo
    const tempDiv = document.createElement('div');
    tempDiv.style.padding = '16px';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.fontSize = '12px';
    tempDiv.style.lineHeight = '1.4';
    tempDiv.style.whiteSpace = 'pre-wrap';
    tempDiv.style.wordBreak = 'break-word';

    tempDiv.innerText = this.risultatoN8n; // ✅ più sicuro di innerHTML

    document.body.appendChild(tempDiv);

    await html2pdf()
      .from(tempDiv)
      .set({
        margin: 10,
        filename: 'piano-allenamento.pdf',
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: {
          scale: 2,
          useCORS: true
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        }
      })
      .save();

    // 🧹 Cleanup
    document.body.removeChild(tempDiv);
  }
}
