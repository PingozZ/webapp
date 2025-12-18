import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SchedaAllenamento } from './scheda-allenamento/scheda-allenamento';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatButtonModule, HttpClientModule, FormsModule,SchedaAllenamento],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Progetto');
}
