import { Routes } from '@angular/router';
import { UpdateSchedaComponent } from './pagina-update/pagina-update';
import { SchedaAllenamento } from './scheda-allenamento/scheda-allenamento';
import { Nutrizione } from './Nutrizione/nutrizione/nutrizione';
import { CertificatoDigitale } from './certificato-digitale/certificato-digitale';

export const routes: Routes = [
    { path: '', component: CertificatoDigitale },
    { path: 'pagina-update', component: UpdateSchedaComponent },
    { path: 'scheda-allenamento', component: SchedaAllenamento }, // ✅ Cambiato qui
    { path: 'nutrizione', component: Nutrizione } // ✅ Anche questo per coerenza
];