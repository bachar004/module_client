import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClientsService, Client } from '../services/clients.service';

@Component({
  selector: 'app-listeclients',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './listeclients.html',
  styleUrl: './listeclients.css'
})
export class Listeclients implements OnInit {
  clients: Client[] = [];
  loading = true;
  error = '';

  constructor(private clientsService: ClientsService) {}

  ngOnInit() {
    this.chargerClients();
  }

  chargerClients() {
    this.loading = true;
    this.clientsService.getClients().subscribe({
      next: (data) => {
        this.clients = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des clients';
        this.loading = false;
      }
    });
  }

  supprimerClient(id: string) {
    if (confirm('Voulez-vous vraiment supprimer ce client ?')) {
      this.clientsService.supprimerClient(id).subscribe({
        next: () => {
          alert('Client supprimé avec succès');
          this.chargerClients();
        },
        error: (err) => {
          alert('Erreur lors de la suppression');
        }
      });
    }
  }

  getStatutClass(statut: string): string {
    return statut === 'actif' ? 'badge bg-success' : 
           statut === 'inactif' ? 'badge bg-secondary' : 
           'badge bg-warning';
  }
}