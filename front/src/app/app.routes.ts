import { Routes } from '@angular/router';
import { Dashboard } from '../dashboard/dashboard';
import { Listeclients } from '../listeclients/listeclients';
import { Newclient } from '../newclient/newclient';
import { Listecommandes } from '../listecommandes/listecommandes';
import { Nouvellecommande } from '../nouvellecommande/nouvellecommande';

export const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'clients/list', component: Listeclients },
      { path: 'clients/new', component: Newclient },
      { path: 'commandes/list', component: Listecommandes },
      { path: 'commandes/new', component: Nouvellecommande },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];