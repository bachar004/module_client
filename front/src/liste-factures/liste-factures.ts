import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FactureService } from '../services/facture.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-liste-factures',
  templateUrl: './liste-factures.html',
  styleUrls: ['./liste-factures.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ListeFacturesComponent implements OnInit {

  factures: any[] = [];
  facturesFiltrees: any[] = [];

  loading = false;
  error = '';

  // Filtres
  filtreStatut = '';
  filtreRecherche = '';

  // Statistiques
  stats = {
    total: 0,
    impayees: 0,
    partiellementPayees: 0,
    payees: 0,
    montantTotal: 0,
    montantPaye: 0,
    soldeRestant: 0
  };

  constructor(
    private factureService: FactureService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.chargerFactures();
  }

  // =============================
  // LOAD FACTURES
  // =============================
  chargerFactures(): void {
    this.loading = true;
    this.error = '';

    this.factureService.getAllFactures(this.filtreStatut).subscribe({
      next: (res) => {
        this.factures = res.factures || [];
        this.facturesFiltrees = [...this.factures];
        this.calculerStatistiques();
        this.appliquerFiltres();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erreur lors du chargement des factures';
        this.loading = false;
      }
    });
  }

  // =============================
  // STATISTICS
  // =============================
  calculerStatistiques(): void {
    this.stats = {
      total: this.factures.length,
      impayees: this.factures.filter(f => f.statut === 'impayee').length,
      partiellementPayees: this.factures.filter(f => f.statut === 'partiellement_payee').length,
      payees: this.factures.filter(f => f.statut === 'payee').length,
      montantTotal: this.factures.reduce((s, f) => s + (f.montantTotal || 0), 0),
      montantPaye: this.factures.reduce((s, f) => s + (f.montantPaye || 0), 0),
      soldeRestant: this.factures.reduce((s, f) => s + (f.soldeRestant || 0), 0)
    };
  }

  // =============================
  // FILTERING
  // =============================
  appliquerFiltres(): void {
    const search = this.filtreRecherche.toLowerCase();

    this.facturesFiltrees = this.factures.filter(f => {
      const matchStatut =
        !this.filtreStatut || f.statut === this.filtreStatut;

      const matchRecherche =
        !search ||
        f.numeroFacture?.toLowerCase().includes(search) ||
        f.client?.nom?.toLowerCase().includes(search) ||
        f.client?.prenom?.toLowerCase().includes(search);

      return matchStatut && matchRecherche;
    });
  }

  changerFiltreStatut(statut: string): void {
    this.filtreStatut = statut;
    this.chargerFactures();
  }

  // =============================
  // UI HELPERS
  // =============================
  getStatutBadgeClass(statut: string): string {
    switch (statut) {
      case 'payee': return 'bg-success';
      case 'partiellement_payee': return 'bg-warning';
      case 'impayee': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'payee': return 'Payée';
      case 'partiellement_payee': return 'Partiellement payée';
      case 'impayee': return 'Impayée';
      default: return statut;
    }
  }

  // =============================
  // NAVIGATION
  // =============================
  voirDetails(id: string): void {
    this.router.navigate(['/factures/details', id]);
  }

  effectuerPaiement(facture: any): void {
    this.router.navigate(
      ['/factures/paiement', facture.client._id],
      { queryParams: { factureId: facture._id } }
    );
  }
}
