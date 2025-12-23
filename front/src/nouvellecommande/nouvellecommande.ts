import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommandesService, Article } from '../services/commandes.service';
import { ClientsService, Client } from '../services/clients.service';

@Component({
  selector: 'app-nouvellecommande',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nouvellecommande.html',
  styleUrl: './nouvellecommande.css'
})
export class Nouvellecommande implements OnInit {
  clients: Client[] = [];
  clientsActifs: Client[] = [];
  
  commande = {
    client: '',
    articles: [] as Article[],
    notes: ''
  };

  nouvelArticle: Article = {
    produit: '',
    quantite: 1,
    prixUnitaire: 0
  };

  loading = false;
  loadingClients = true;
  error = '';

  constructor(
    private commandesService: CommandesService,
    private clientsService: ClientsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.chargerClients();
  }

  chargerClients() {
    this.loadingClients = true;
    this.clientsService.getClients().subscribe({
      next: (data) => {
        this.clients = data;
        this.clientsActifs = data.filter(c => c.statut === 'actif');
        this.loadingClients = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des clients', err);
        this.loadingClients = false;
      }
    });
  }

  getClientName(clientId: string): string {
    const client = this.clientsActifs.find(c => c._id === clientId);
    return client ? `${client.prenom} ${client.nom}` : 'Non trouvé';
  }

  ajouterArticle() {
    if (!this.nouvelArticle.produit || this.nouvelArticle.quantite <= 0 || this.nouvelArticle.prixUnitaire <= 0) {
      alert('Veuillez remplir tous les champs de l\'article');
      return;
    }

    const article: Article = {
      produit: this.nouvelArticle.produit,
      quantite: this.nouvelArticle.quantite,
      prixUnitaire: this.nouvelArticle.prixUnitaire,
      total: this.nouvelArticle.quantite * this.nouvelArticle.prixUnitaire
    };

    this.commande.articles.push(article);

    // Réinitialiser le formulaire
    this.nouvelArticle = {
      produit: '',
      quantite: 1,
      prixUnitaire: 0
    };
  }

  supprimerArticle(index: number) {
    this.commande.articles.splice(index, 1);
  }

  calculerMontantTotal(): number {
    return this.commande.articles.reduce((total, article) => total + (article.total || 0), 0);
  }

  validerFormulaire(): boolean {
    if (!this.commande.client) {
      alert('Veuillez sélectionner un client');
      return false;
    }

    if (this.commande.articles.length === 0) {
      alert('Veuillez ajouter au moins un article');
      return false;
    }

    return true;
  }

  creerCommande() {
    if (!this.validerFormulaire()) {
      return;
    }

    this.loading = true;
    this.error = '';

    const commandeData = {
      client: this.commande.client,
      articles: this.commande.articles,
      notes: this.commande.notes,
      montantTotal: this.calculerMontantTotal()
    };

    this.commandesService.creerCommande(commandeData as any).subscribe({
      next: (response) => {
        alert('Commande créée avec succès !');
        this.router.navigate(['/commandes/list']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la création de la commande';
        this.loading = false;
        console.error(err);
      }
    });
  }

  annuler() {
    if (confirm('Voulez-vous annuler la création de cette commande ?')) {
      this.router.navigate(['/commandes/list']);
    }
  }
}