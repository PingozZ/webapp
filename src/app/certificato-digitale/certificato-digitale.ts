import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-certificato-digitale',
  standalone: true,
  templateUrl: './certificato-digitale.html',
  styleUrls: ['./certificato-digitale.scss'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class CertificatoDigitale implements OnInit {

  form!: FormGroup;

  loading = false;
  step = 1;
  otpCode = '';
  serverOtp = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef // ✅ Aggiungi questo
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      terms: [false, Validators.requiredTrue]
    });
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.value.password !== this.form.value.confirmPassword) {
      this.errorMessage = 'Le password non coincidono';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const payload = this.form.value;

    try {
      console.log('🚀 Invio payload:', payload);

      const response = await fetch('http://localhost:5678/webhook/certificato-digitale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`);
      }

      const result = await response.json();

      if (result && result.otp) {
        this.serverOtp = result.otp.toString();
       
        // Passa allo step 2
        this.step = 2;
        
        // ✅ Forza il rilevamento dei cambiamenti
        this.cdr.detectChanges();
        
      } else {
        console.error('❌ OTP mancante');
        this.errorMessage = 'Errore: OTP non ricevuto dal server.';
      }

    } catch (error) {
      console.error('💥 Errore:', error);
      this.errorMessage = `Errore di connessione: ${error}`;
    } finally {
      this.loading = false;
      this.cdr.detectChanges(); // ✅ Forza anche qui
    }
  }

  verifyCode(): void {
    if (!this.otpCode || this.otpCode.trim() === '') {
      this.errorMessage = 'Inserisci il codice OTP';
      return;
    }

    this.errorMessage = '';
    this.loading = true;

    if (this.otpCode.trim() === this.serverOtp) {
      this.router.navigate(['/scheda-allenamento']);
    } else {
      this.errorMessage = 'Codice errato. Riprova.';
      this.otpCode = '';
      this.loading = false;
    }
  }
}