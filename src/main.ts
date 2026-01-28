import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { App } from './app/app';
import { routes } from './app/app.routes'; // ✅ Importa le rotte

bootstrapApplication(App, {
  providers: [
    provideRouter(routes) // ✅ Fornisci le rotte
  ]
}).catch(err => console.error(err));