import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import jsPDF from 'jspdf';

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
    RouterLink
  ],
  templateUrl: './scheda-allenamento.html',
  styleUrls: ['./scheda-allenamento.scss'],
})
export class SchedaAllenamento {

  // -----------------------------
  // 📌 Campi del form
  // -----------------------------
  nome = '';
  sesso = '';
  eta: number | null = null;
  peso: number | null = null;
  altezza: number | null = null;
  obiettivi: string[] = [];
  livello = '';
  giorni = '';
  restrizioni = '';

  // -----------------------------
  // 📌 Stato applicazione
  // -----------------------------
  risultatoN8n = '';
  isLoading = false;

  private apiUrl = 'https://authority-accompanying-daily-visits.trycloudflare.com/webhook/personal-trainer';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  // ============================================================
  // 🚀 Invio dati a n8n
  // ============================================================
  inviaScheda() {

    // Validazione minima
    const campiObbligatori = [
      this.nome, this.sesso, this.eta, this.peso,
      this.altezza, this.livello, this.giorni
    ];

    if (campiObbligatori.includes(null) || campiObbligatori.includes('') || this.obiettivi.length === 0) {
      alert('⚠️ Compila tutti i campi obbligatori prima di generare il piano!');
      return;
    }

    this.isLoading = true;
    this.risultatoN8n = '';
    this.cdr.detectChanges();

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

    console.log('📤 Invio richiesta a n8n:', payload);

    this.http.post(this.apiUrl, payload, { responseType: 'text' }).subscribe({
      next: (res) => {
        console.log('✅ Risposta ricevuta da n8n');

        this.risultatoN8n = res || 'Nessun contenuto ricevuto';
        this.isLoading = false;
        this.cdr.detectChanges();

        // Scroll al risultato
        setTimeout(() => {
          document.querySelector('.result-card')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
      },

      error: (err) => {
        console.error('❌ Errore POST verso n8n:', err);

        this.risultatoN8n = '❌ Errore nella generazione del piano. Riprova più tardi.';
        this.isLoading = false;
        this.cdr.detectChanges();

        alert('Si è verificato un errore durante la generazione del piano. Verifica che il server n8n sia attivo.');
      },

      complete: () => {
        if (this.isLoading) {
          console.warn('⚠️ FAILSAFE: Loading ancora attivo, disattivazione forzata');
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      }
    });
  }
  // ============================================================
  // 📄 Esporta PDF
  // ============================================================
  esportaPDF() {
    if (!this.risultatoN8n || !this.risultatoN8n.trim()) {
      alert('⚠️ Nessun contenuto da esportare');
      return;
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const marginX = 15;
    let cursorY = 20;

    // ===== TITOLO =====
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text('Scheda Allenamento Personalizzata', pageWidth / 2, cursorY, { align: 'center' });
    cursorY += 10;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generata il ${new Date().toLocaleDateString('it-IT')}`, pageWidth / 2, cursorY, { align: 'center' });
    cursorY += 15;

    // ===== DATI PERSONALI =====
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Dati personali', marginX, cursorY);
    cursorY += 8;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);

    const dati = [
      `Nome: ${this.nome}`,
      `Sesso: ${this.sesso === 'M' ? 'Maschio' : 'Femmina'}`,
      `Età: ${this.eta} anni`,
      `Peso: ${this.peso} kg`,
      `Altezza: ${this.altezza} cm`,
      `Livello: ${this.livello}`,
      `Giorni disponibili: ${this.giorni}`,
      `Obiettivi: ${this.obiettivi.join(', ')}`,
      this.restrizioni ? `Restrizioni: ${this.restrizioni}` : ''
    ].filter(Boolean);

    dati.forEach(riga => {
      pdf.text(riga, marginX, cursorY);
      cursorY += 6;
    });

    cursorY += 10;

    // ===== PIANO ALLENAMENTO =====
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Piano di allenamento', marginX, cursorY);
    cursorY += 8;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);

    // ===== PULIZIA TESTO E SOSTITUZIONE EMOJI =====
    let testoPulito = (this.risultatoN8n || '').toString();

    const emojiMap: Record<string, string> = {
      '💪': '[FORZA]',
      '📅': '[SETT]',
      '🗓️': '[GIORNO]',
      '⚠️': '[ATTENZIONE]',
    };

    // sostituisce le emoji con simboli brevi
    Object.keys(emojiMap).forEach(key => {
      testoPulito = testoPulito.split(key).join(emojiMap[key]);
    });

    // rimuove altri caratteri problematici
    testoPulito = testoPulito
      .replace(/[•–]/g, '-')
      .replace(/\*\*/g, '')
      .replace(/\r/g, '')
      .replace(/[^\x00-\xFF]/g, ''); // rimuove eventuali caratteri non ASCII

    // split in righe compatibili con jsPDF
    const righe = pdf.splitTextToSize(
      testoPulito || 'Nessun contenuto disponibile',
      pageWidth - marginX * 2
    ) || ['Nessun contenuto disponibile'];

    // stampa le righe
    if (Array.isArray(righe) && righe.length) {
      righe.forEach(riga => {
        if (cursorY > 280) { // nuova pagina
          pdf.addPage();
          cursorY = 20;
        }
        pdf.text(riga, marginX, cursorY);
        cursorY += 6;
      });
    }

    // ===== SALVATAGGIO =====
    const fileName = `scheda-allenamento-${this.nome.replace(/\s+/g, '-').toLowerCase()}.pdf`;
    pdf.save(fileName);

    alert('✅ PDF Creato');
  }
}