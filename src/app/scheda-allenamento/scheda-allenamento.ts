import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

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
  nome = '';
  sesso = '';
  eta: number | null = null;
  peso: number | null = null;
  altezza: number | null = null;
  obiettivi: string[] = [];
  livello = '';
  giorni = '';
  restrizioni = '';

  // ✅ Risultato SEMPRE stringa
  risultatoN8n: string = '';

  private apiUrl = 'http://localhost:8080/webhook/personal-trainer';

  constructor(private http: HttpClient) { }

  // 🔹 Invio dati a n8n
  inviaScheda() {
    const payload = {
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


    this.http.post(this.apiUrl, payload, { responseType: 'text' }).subscribe({
      next: (res: string) => {
        this.risultatoN8n = res;
      },
      error: (err) => {
        console.error('Errore POST verso n8n:', err);
        this.risultatoN8n = 'Errore nella generazione del piano.';
      }
    });

  }

  // 🔹 Esporta in PDF (con pagebreak e gestione testo lungo)
  async esportaPDF() {
    if (!this.risultatoN8n || this.risultatoN8n.trim().length === 0) {
      return;
    }

    const html2pdf = (await import('html2pdf.js')).default;

    const tempDiv = document.createElement('div');
    tempDiv.style.padding = '16px';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.fontSize = '12px';
    tempDiv.style.lineHeight = '1.5';
    tempDiv.style.whiteSpace = 'pre-wrap';
    tempDiv.style.wordBreak = 'break-word';

    // 👇 Usa innerHTML per gestire i \n come <br>
    tempDiv.innerHTML = this.risultatoN8n.replace(/\n/g, '<br>');

    document.body.appendChild(tempDiv);

    // 👉 Tipizza le opzioni come any per includere pagebreak
    const options: any = {
      margin: 12,
      filename: 'piano-allenamento.pdf',
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] } // 👈 ora non dà errore
    };

    await (html2pdf() as any).from(tempDiv).set(options).save();

    document.body.removeChild(tempDiv);

  }
}
