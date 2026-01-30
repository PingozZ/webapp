import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import jsPDF from 'jspdf';
import { timeout, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router, RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-pagina-update',
  templateUrl: './pagina-update.html',
  styleUrls: ['./pagina-update.scss'],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatRadioModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatSnackBarModule,
   // RouterLink
  ]
})
export class UpdateSchedaComponent {

  pdfFile: File | null = null;
  feedback: string = '';
  risultatoN8n: string = '';
  richieste: string[] = [];
  note: string = '';
  nome: string = '';
  richiediNuovaScheda: boolean = false;
  isLoading: boolean = false;
  progressMessage: string = 'Inizializzazione...';

  private readonly WEBHOOK_URL = 'https://authority-accompanying-daily-visits.trycloudflare.com/pagina-update';
  private readonly TIMEOUT_MS = 300000;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.pdfFile = input.files[0];

      const maxSize = 10 * 1024 * 1024;
      if (this.pdfFile.size > maxSize) {
        this.snackBar.open('Il file è troppo grande (max 10MB)', 'Chiudi', { duration: 4000 });
        this.pdfFile = null;
        input.value = '';
        return;
      }

      if (this.pdfFile.type !== 'application/pdf') {
        this.snackBar.open('Seleziona un file PDF valido', 'Chiudi', { duration: 4000 });
        this.pdfFile = null;
        input.value = '';
        return;
      }

      this.snackBar.open(`PDF caricato: ${this.pdfFile.name}`, 'OK', { duration: 3000 });
    }
  }

  inviaFeedback(): void {
    if (!this.pdfFile) {
      this.snackBar.open('⚠️ Carica un PDF prima di continuare', 'Chiudi', { duration: 4000 });
      return;
    }

    if (!this.feedback) {
      this.snackBar.open('⚠️ Seleziona una valutazione dell\'allenamento', 'Chiudi', { duration: 4000 });
      return;
    }

    this.isLoading = true;
    this.risultatoN8n = '';
    this.progressMessage = 'Caricamento file...';

    const formData = new FormData();
    formData.append('feedback', this.feedback);
    formData.append('pdf', this.pdfFile, this.pdfFile.name);
    formData.append('note', this.note || '');
    formData.append('richiediNuovaScheda', String(this.richiediNuovaScheda));
    formData.append('richieste', JSON.stringify(this.richieste));

    setTimeout(() => { if (this.isLoading) this.progressMessage = 'Analisi in corso...'; }, 2000);
    setTimeout(() => { if (this.isLoading) this.progressMessage = 'Generazione scheda...'; }, 5000);
    setTimeout(() => { if (this.isLoading) this.progressMessage = 'Quasi pronto...'; }, 10000);

    this.http.post(
      this.WEBHOOK_URL,
      formData,
      { responseType: 'text', observe: 'response' }
    ).pipe(
      timeout(this.TIMEOUT_MS),
      catchError((error: any) => throwError(() => error))
    ).subscribe({
      next: (response) => {
        setTimeout(() => {
          this.isLoading = false;
          this.progressMessage = 'Inizializzazione...';

          let contenuto = '';

          try {
            if (typeof response.body === 'string') {
              const trimmed = response.body.trim();
              if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                try {
                  const parsed = JSON.parse(trimmed);
                  contenuto = parsed.output ||
                              parsed.text ||
                              parsed.content ||
                              parsed.data ||
                              parsed.result ||
                              parsed.message ||
                              parsed.body ||
                              JSON.stringify(parsed, null, 2);
                } catch {
                  contenuto = trimmed;
                }
              } else {
                contenuto = trimmed;
              }
            } else if (response.body) {
              contenuto = String(response.body).trim();
            }

            this.risultatoN8n = contenuto;

            if (this.risultatoN8n.length > 0) {
              this.snackBar.open('✅ Piano aggiornato ricevuto! Ora puoi esportare il PDF.', 'OK', { duration: 5000 });
            } else {
              this.snackBar.open('⚠️ Risposta vuota ricevuta dal server', 'Chiudi', { duration: 5000 });
            }

            this.cdr.detectChanges();

          } catch {
            this.snackBar.open('❌ Errore nel processamento della risposta', 'Chiudi', { duration: 5000 });
          }
        }, 0);
      },

      error: (err: any) => {
        setTimeout(() => {
          this.isLoading = false;
          this.progressMessage = 'Inizializzazione...';

          let messaggioErrore = 'Errore sconosciuto';

          if (err.name === 'TimeoutError') messaggioErrore = 'Timeout: il processo ha impiegato più di 5 minuti.';
          else if (err.status === 0) messaggioErrore = 'Impossibile connettersi al server n8n.';
          else if (err.status === 504 || err.status === 408) messaggioErrore = 'Il server ha impiegato troppo tempo.';
          else if (err.status === 413) messaggioErrore = 'Il PDF è troppo grande.';
          else if (err.status === 400) messaggioErrore = 'Dati non validi.';
          else if (err.status === 500) messaggioErrore = 'Errore interno del server.';
          else messaggioErrore = `Errore ${err.status}: ${err.message}`;

          this.snackBar.open(`❌ ${messaggioErrore}`, 'Chiudi', { duration: 7000 });
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }

  esportaPDF(): void {
    if (!this.risultatoN8n || !this.risultatoN8n.trim()) {
      this.snackBar.open('⚠️ Nessun contenuto da esportare', 'Chiudi', { duration: 4000 });
      return;
    }

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const marginX = 15;
      const marginY = 20;
      let cursorY = marginY;

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.text('Scheda Allenamento Aggiornata', pageWidth / 2, cursorY, { align: 'center' });
      cursorY += 10;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      const dataGenerazione = new Date().toLocaleDateString('it-IT', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      pdf.text(`Generata il ${dataGenerazione}`, pageWidth / 2, cursorY, { align: 'center' });
      cursorY += 15;

      pdf.setDrawColor(200, 200, 200);
      pdf.line(marginX, cursorY, pageWidth - marginX, cursorY);
      cursorY += 10;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);

      let testoPulito = this.risultatoN8n.toString();

      const emojiMap: Record<string, string> = {
        '💪': '[FORZA]',
        '📅': '[CALENDARIO]',
        '🗓️': '[GIORNO]',
        '⚠️': '[ATTENZIONE]',
        '✅': '[OK]',
        '❌': '[NO]',
        '🔥': '[FUOCO]',
        '⭐': '[STELLA]',
        '📈': '[CRESCITA]',
        '🎯': '[OBIETTIVO]',
      };

      Object.entries(emojiMap).forEach(([emoji, testo]) => {
        testoPulito = testoPulito.split(emoji).join(testo);
      });

      testoPulito = testoPulito
        .replace(/[•–—]/g, '-')
        .replace(/\*\*/g, '')
        .replace(/\r/g, '')
        .replace(/[^\x00-\xFF]/g, '');

      const righe = pdf.splitTextToSize(
        testoPulito,
        pageWidth - (marginX * 2)
      );

      if (Array.isArray(righe) && righe.length > 0) {
        righe.forEach((riga: string) => {
          if (cursorY > pageHeight - marginY) {
            pdf.addPage();
            cursorY = marginY;
          }
          pdf.text(riga, marginX, cursorY);
          cursorY += 6;
        });
      } else {
        pdf.text('Nessun contenuto disponibile', marginX, cursorY);
      }

      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(9);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Pagina ${i} di ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      const timestamp = new Date().getTime();
      const nomeFile = this.nome?.trim()
        ? this.nome.replace(/\s+/g, '-').toLowerCase()
        : 'utente';
      const fileName = `scheda-allenamento-${nomeFile}-${timestamp}.pdf`;

      pdf.save(fileName);

      this.snackBar.open('✅ PDF esportato con successo!', 'OK', { duration: 4000 });

    } catch {
      this.snackBar.open('❌ Errore durante la creazione del PDF', 'Chiudi', { duration: 5000 });
    }
  }

  resetForm(): void {
    this.pdfFile = null;
    this.feedback = '';
    this.risultatoN8n = '';
    this.richieste = [];
    this.note = '';
    this.richiediNuovaScheda = false;
    this.isLoading = false;
    this.progressMessage = 'Inizializzazione...';

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';

    this.snackBar.open('📝 Modulo resettato', 'OK', { duration: 2000 });
  }
}
