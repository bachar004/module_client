import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CommandesService, CommandeStats } from '../services/commandes.service';
import { ClientsService } from '../services/clients.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  stats: CommandeStats = {
    totalCommandes: 0,
    commandesEnAttente: 0,
    commandesValidees: 0,
    commandesAnnulees: 0,
    montantTotal: 0
  };

  totalClients = 0;
  clientsActifs = 0;
  
  loading = true;

  constructor(
    private commandesService: CommandesService,
    private clientsService: ClientsService
  ) {}

  ngOnInit() {
    this.chargerStatistiques();
    this.chargerClients();
  }

  chargerStatistiques() {
    this.commandesService.getStatistiques().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement stats', err);
        this.loading = false;
      }
    });
  }

  chargerClients() {
    this.clientsService.getClients().subscribe({
      next: (data) => {
        this.totalClients = data.length;
        this.clientsActifs = data.filter(c => c.statut === 'actif').length;
      },
      error: (err) => {
        console.error('Erreur chargement clients', err);
      }
    });
  }

  getTauxValidation(): number {
    if (this.stats.totalCommandes === 0) return 0;
    return (this.stats.commandesValidees / this.stats.totalCommandes) * 100;
  }
}