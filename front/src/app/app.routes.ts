import { Routes } from '@angular/router';
import { Dashboard } from '../dashboard/dashboard';
import { Listeclients } from '../listeclients/listeclients';
import { Newclient } from '../newclient/newclient';
import { Listecommandes } from '../listecommandes/listecommandes';
import { Nouvellecommande } from '../nouvellecommande/nouvellecommande';
import { ListeFacturesComponent } from '../liste-factures/liste-factures';
import { DetailsFactureComponent } from '../details-facture/details-facture';
import { PaiementFactureComponent } from '../paiement-facture/paiement-facture';

export const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'clients/list', component: Listeclients },
      { path: 'clients/new', component: Newclient },
      { path: 'commandes/list', component: Listecommandes },
      { path: 'commandes/new', component: Nouvellecommande },
      {path:'factures/list',component:ListeFacturesComponent},
      {path:'factures/details/:id',component:DetailsFactureComponent},
      {path:'factures/paiement/:id',component:PaiementFactureComponent},
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];