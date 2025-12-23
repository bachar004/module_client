import { Component } from '@angular/core';
import { ClientService } from '../client-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-newclient',
  imports: [CommonModule,FormsModule],
  templateUrl: './newclient.html',
  styleUrl: './newclient.css',
})
export class Newclient {
    addclient: any = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    statut: 'actif',
    soldeCompte: 0,
    adresse: {
      rue: '',
      ville: '',
      codePostal: '',
      pays: ''
    }
  }; 
  constructor(private service:ClientService){}
  ajoutclient(form:any){
    this.service.ajouterclient(this.addclient).subscribe({
      next:(value)=>{
        console.log(value)
        this.annuler(form)
      },
      error:(err)=>{
          console.log(err.message)
      },
    })
    
  }
  annuler(form:any){
      this.addclient = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    statut: 'actif',
    soldeCompte: 0,
    adresse: { rue: '', ville: '', codePostal: '', pays: '' }
  };
  form.resetForm();
  }; 
}
