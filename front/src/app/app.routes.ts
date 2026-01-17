import { Routes } from '@angular/router';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { Listeclients } from '../listeclients/listeclients';
import { Newclient } from '../newclient/newclient';
import { Listecommandes } from '../listecommandes/listecommandes';
import { Nouvellecommande } from '../nouvellecommande/nouvellecommande';
import { ListeFacturesComponent } from '../liste-factures/liste-factures';
import { DetailsFactureComponent } from '../details-facture/details-facture';
import { PaiementFactureComponent } from '../paiement-facture/paiement-facture';
import { Listepaiements } from '../listepaiements/listepaiements';
import { Detailspaiement } from '../detailspaiement/detailspaiement';
import { TicketListComponent } from './tickets/ticket-list/ticket-list';
import { TicketCreateComponent } from './tickets/ticket-create/ticket-create';
import { TicketDetailComponent } from './tickets/ticket-detail/ticket-detail';

export const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'clients/list', component: Listeclients },
      { path: 'clients/new', component: Newclient },
      { path: 'commandes/list', component: Listecommandes },
      { path: 'commandes/new', component: Nouvellecommande },
      { path: 'factures/list', component: ListeFacturesComponent },
      { path: 'factures/details/:id', component: DetailsFactureComponent },
      { path: 'factures/paiement/:id', component: PaiementFactureComponent },
      { path: 'paiements', component: Listepaiements },
      { path: 'paiements/details/:id', component: Detailspaiement },
      { path: 'tickets/list', component: TicketListComponent },
      { path: 'tickets/new', component: TicketCreateComponent },
      { path: 'tickets/details/:id', component: TicketDetailComponent },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
