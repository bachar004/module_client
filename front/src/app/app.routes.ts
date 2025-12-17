import { Routes } from '@angular/router';
import { App } from './app';
import { Dashboard } from '../dashboard/dashboard';
import { Listeclients } from '../listeclients/listeclients';
import { Newclient } from '../newclient/newclient';


export const routes: Routes = [
     {
    path: '',
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'clients/list', component: Listeclients },
      { path: 'clients/new', component: Newclient},
      
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
