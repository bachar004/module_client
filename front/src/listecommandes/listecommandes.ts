import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommandesService, Commande } from '../services/commandes.service';

@Component({
  selector: 'app-listecommandes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listecommandes.html',
  styleUrl: './listecommandes.css'
})
export class Listecommandes implements OnInit {
  commandes: Commande[] = [];
  commandesFiltrees: Commande[] = [];
  loading = true;
  error = '';
  
  filtreStatut = 'tous';
  searchTerm = '';
  
  commandeSelectionnee: Commande | null = null;
  showDetailModal = false;
  showAnnulationModal = false;
  raisonAnnulation = '';

  constructor(private commandesService: CommandesService) {}

  ngOnInit() {
    this.chargerCommandes();
  }

  chargerCommandes() {
    this.loading = true;
    this.error = '';
    
    this.commandesService.getCommandes().subscribe({
      next: (data) => {
        this.commandes = data;
        this.appliquerFiltres();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des commandes';
        this.loading = false;
        console.error(err);
      }
    });
  }

  appliquerFiltres() {
    let resultats = [...this.commandes];

    // Filtre par statut
    if (this.filtreStatut !== 'tous') {
      resultats = resultats.filter(cmd => cmd.statut === this.filtreStatut);
    }

    // Filtre par recherche
    if (this.searchTerm) {
      const terme = this.searchTerm.toLowerCase();
      resultats = resultats.filter(cmd => 
        cmd.numeroCommande?.toLowerCase().includes(terme) ||
        cmd.client?.nom?.toLowerCase().includes(terme) ||
        cmd.client?.prenom?.toLowerCase().includes(terme)
      );
    }

    this.commandesFiltrees = resultats;
  }

  onFiltreChange() {
    this.appliquerFiltres();
  }

  onSearch() {
    this.appliquerFiltres();
  }

  voirDetails(commande: Commande) {
    this.commandeSelectionnee = commande;
    this.showDetailModal = true;
  }

  fermerModal() {
    this.showDetailModal = false;
    this.showAnnulationModal = false;
    this.commandeSelectionnee = null;
    this.raisonAnnulation = '';
  }

  validerCommande(commande: Commande) {
    if (!commande._id) return;
    
    if (confirm('Voulez-vous valider cette commande ?')) {
      this.commandesService.validerCommande(commande._id).subscribe({
        next: () => {
          alert('Commande validée avec succès');
          this.chargerCommandes();
          this.fermerModal();
        },
        error: (err) => {
          alert('Erreur lors de la validation: ' + err.error.message);
        }
      });
    }
  }

  ouvrirModalAnnulation(commande: Commande) {
    this.commandeSelectionnee = commande;
    this.showAnnulationModal = true;
  }

  confirmerAnnulation() {
    if (!this.commandeSelectionnee?._id) return;
    
    if (!this.raisonAnnulation.trim()) {
      alert('Veuillez saisir une raison d\'annulation');
      return;
    }

    this.commandesService.annulerCommande(
      this.commandeSelectionnee._id, 
      this.raisonAnnulation
    ).subscribe({
      next: () => {
        alert('Commande annulée avec succès');
        this.chargerCommandes();
        this.fermerModal();
      },
      error: (err) => {
        alert('Erreur lors de l\'annulation: ' + err.error.message);
      }
    });
  }

  supprimerCommande(id: string) {
    if (confirm('Voulez-vous vraiment supprimer cette commande ?')) {
      this.commandesService.supprimerCommande(id).subscribe({
        next: () => {
          alert('Commande supprimée avec succès');
          this.chargerCommandes();
        },
        error: (err) => {
          alert('Erreur lors de la suppression: ' + err.error.message);
        }
      });
    }
  }

  getStatutClass(statut: string): string {
    const classes: { [key: string]: string } = {
      'en_attente': 'statut-attente',
      'validee': 'statut-validee',
      'annulee': 'statut-annulee',
      'en_cours': 'statut-encours',
      'livree': 'statut-livree'
    };
    return classes[statut] || '';
  }

  getStatutLibelle(statut: string): string {
    const libelles: { [key: string]: string } = {
      'en_attente': 'En attente',
      'validee': 'Validée',
      'annulee': 'Annulée',
      'en_cours': 'En cours',
      'livree': 'Livrée'
    };
    return libelles[statut] || statut;
  }
}