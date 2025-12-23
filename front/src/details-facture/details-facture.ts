import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FactureService } from '../services/facture.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-details-facture',
  templateUrl: './details-facture.html',
  styleUrls: ['./details-facture.css'],
  imports: [CommonModule]
})
export class DetailsFactureComponent implements OnInit {
  facture: any = null;
  loading = false;
  error = '';
  factureId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private factureService: FactureService
  ) {}

  ngOnInit(): void {
    this.factureId = this.route.snapshot.params['id'];
    this.chargerFacture();
  }

  chargerFacture(): void {
    this.loading = true;
    this.error = '';

    this.factureService.getFactureById(this.factureId).subscribe({
      next: (data) => {
        this.facture = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de la facture';
        console.error(err);
        this.loading = false;
      }
    });
  }

  retour(): void {
    this.router.navigate(['/factures']);
  }

  effectuerPaiement(): void {
    this.router.navigate(['/factures/paiement', this.facture.client._id], {
      queryParams: { factureId: this.facture._id }
    });
  }

  imprimerFacture(): void {
    window.print();
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

  getModePaiementLabel(mode: string): string {
    if (!mode) return 'Non défini';
    switch (mode) {
      case 'especes': return 'Espèces';
      case 'carte': return 'Carte bancaire';
      case 'virement': return 'Virement';
      case 'cheque': return 'Chèque';
      default: return mode;
    }
  }
}