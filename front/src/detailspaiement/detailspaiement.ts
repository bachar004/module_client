import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FactureService } from '../services/facture.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-details-paiement',
  templateUrl: './detailspaiement.html',
  styleUrls: ['./detailspaiement.css'],
  standalone: true,
  imports: [CommonModule]
})
export class Detailspaiement implements OnInit {
  paiement: any = null;
  facture: any = null;
  historiquePaiements: any[] = [];
  loading = false;
  error = '';
  paiementId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private factureService: FactureService
  ) {}

  ngOnInit(): void {
    this.paiementId = this.route.snapshot.params['id'];
    this.chargerPaiement();
  }

  chargerPaiement(): void {
    this.loading = true;
    this.error = '';

    this.factureService.getPaiementById(this.paiementId).subscribe({
      next: (data) => {
        this.paiement = data;
        
        // Charger l'historique des paiements de la facture
        if (this.paiement?.facture?._id) {
          this.chargerHistoriquePaiements(this.paiement.facture._id);
        } else {
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du paiement';
        console.error(err);
        this.loading = false;
      }
    });
  }

  chargerHistoriquePaiements(factureId: string): void {
    this.factureService.getPaiementsFacture(factureId).subscribe({
      next: (data) => {
        this.facture = data.facture;
        this.historiquePaiements = data.historiquePaiements || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l\'historique:', err);
        this.loading = false;
      }
    });
  }

  retour(): void {
    this.router.navigate(['/paiements']);
  }

  voirFacture(): void {
    if (this.paiement?.facture?._id) {
      this.router.navigate(['/factures/details', this.paiement.facture._id]);
    }
  }

  voirClient(): void {
    if (this.paiement?.client?._id) {
      this.router.navigate(['/clients/details', this.paiement.client._id]);
    }
  }

  voirPaiement(paiementId: string): void {
    this.router.navigate(['/paiements/details', paiementId]);
  }

  imprimerRecu(): void {
    window.print();
  }

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

  getTotalPaiements(): number {
    return this.historiquePaiements.reduce((sum, p) => sum + (p.montant || 0), 0);
  }

  isPaiementActuel(paiementIdToCheck: string): boolean {
    return this.paiementId === paiementIdToCheck;
  }
}