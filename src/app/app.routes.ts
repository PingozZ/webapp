import { Routes } from '@angular/router';
import { UpdateSchedaComponent } from './pagina-update/pagina-update';
import { SchedaAllenamento } from './scheda-allenamento/scheda-allenamento';

export const routes: Routes = [
    { path: 'pagina-update', component: UpdateSchedaComponent },
    { path: '', component: SchedaAllenamento }
];
