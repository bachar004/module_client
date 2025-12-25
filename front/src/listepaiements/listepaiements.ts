import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FactureService } from '../services/facture.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-liste-paiements',
  templateUrl: './listepaiements.html',
  styleUrls: ['./listepaiements.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class Listepaiements implements OnInit {
  paiements: any[] = [];
  paiementsFiltres: any[] = [];
  loading = false;
  error = '';

  // Filtres
  filtreModePaiement = '';
  filtreRecherche = '';
  filtreDateDebut = '';
  filtreDateFin = '';
  filtreMontantMin: number | null = null;
  filtreMontantMax: number | null = null;

  // Pagination
  page = 1;
  limit = 50;
  totalPages = 0;
  totalPaiements = 0;

  // Statistiques
  stats = {
    total: 0,
    montantTotal: 0,
    parEspeces: 0,
    parCarte: 0,
    parVirement: 0,
    parCheque: 0
  };

  constructor(
    private factureService: FactureService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.chargerPaiements();
  }

  // =============================
  // LOAD PAYMENTS
  // =============================
  chargerPaiements(): void {
    this.loading = true;
    this.error = '';

    const params: any = {
      page: this.page,
      limit: this.limit
    };

    if (this.filtreModePaiement) params.modePaiement = this.filtreModePaiement;
    if (this.filtreDateDebut) params.dateDebut = this.filtreDateDebut;
    if (this.filtreDateFin) params.dateFin = this.filtreDateFin;
    if (this.filtreMontantMin !== null) params.montantMin = this.filtreMontantMin;
    if (this.filtreMontantMax !== null) params.montantMax = this.filtreMontantMax;

    this.factureService.getAllPaiements(params).subscribe({
      next: (res) => {
        this.paiements = res.paiements || [];
        this.paiementsFiltres = [...this.paiements];
        this.totalPaiements = res.pagination?.total || 0;
        this.totalPages = res.pagination?.pages || 0;
        this.calculerStatistiques();
        this.appliquerFiltreRecherche();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erreur lors du chargement des paiements';
        this.loading = false;
      }
    });
  }

  // =============================
  // STATISTICS
  // =============================
  calculerStatistiques(): void {
    this.stats = {
      total: this.paiements.length,
      montantTotal: this.paiements.reduce((s, p) => s + (p.montant || 0), 0),
      parEspeces: this.paiements.filter(p => p.modePaiement === 'especes').reduce((s, p) => s + p.montant, 0),
      parCarte: this.paiements.filter(p => p.modePaiement === 'carte').reduce((s, p) => s + p.montant, 0),
      parVirement: this.paiements.filter(p => p.modePaiement === 'virement').reduce((s, p) => s + p.montant, 0),
      parCheque: this.paiements.filter(p => p.modePaiement === 'cheque').reduce((s, p) => s + p.montant, 0)
    };
  }

  // =============================
  // FILTERING
  // =============================
  appliquerFiltres(): void {
    this.page = 1;
    this.chargerPaiements();
  }

  appliquerFiltreRecherche(): void {
    const search = this.filtreRecherche.toLowerCase();

    this.paiementsFiltres = this.paiements.filter(p => {
      return !search ||
        p.facture?.numeroFacture?.toLowerCase().includes(search) ||
        p.client?.nom?.toLowerCase().includes(search) ||
        p.client?.prenom?.toLowerCase().includes(search);
    });
  }

  reinitialiserFiltres(): void {
    this.filtreModePaiement = '';
    this.filtreRecherche = '';
    this.filtreDateDebut = '';
    this.filtreDateFin = '';
    this.filtreMontantMin = null;
    this.filtreMontantMax = null;
    this.page = 1;
    this.chargerPaiements();
  }

  // =============================
  // PAGINATION
  // =============================
  pagePrecedente(): void {
    if (this.page > 1) {
      this.page--;
      this.chargerPaiements();
    }
  }

  pageSuivante(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.chargerPaiements();
    }
  }

  allerALaPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.page = page;
      this.chargerPaiements();
    }
  }

  // =============================
  // UI HELPERS
  // =============================
  getModePaiementBadgeClass(mode: string): string {
    switch (mode) {
      case 'especes': return 'bg-success';
      case 'carte': return 'bg-primary';
      case 'virement': return 'bg-info';
      case 'cheque': return 'bg-warning';
      default: return 'bg-secondary';
    }
  }

  getModePaiementLabel(mode: string): string {
    switch (mode) {
      case 'especes': return 'Espèces';
      case 'carte': return 'Carte bancaire';
      case 'virement': return 'Virement';
      case 'cheque': return 'Chèque';
      default: return mode;
    }
  }

  // =============================
  // NAVIGATION
  // =============================
  voirDetails(id: string): void {
    this.router.navigate(['/paiements/details', id]);
  }

  voirFacture(factureId: string): void {
    this.router.navigate(['/factures/details', factureId]);
  }

  voirClient(clientId: string): void {
    this.router.navigate(['/clients/details', clientId]);
  }
}