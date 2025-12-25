import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FactureService } from '../services/facture.service';
import { ClientsService } from '../services/clients.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-paiement-facture',
  templateUrl: './paiement-facture.html',
  styleUrls: ['./paiement-facture.css'],
  imports: [CommonModule,FormsModule]
})
export class PaiementFactureComponent implements OnInit {
  clientId: string = '';
  client: any = null;
  factures: any[] = [];
  loading = false;
  loadingPaiement = false;
  error = '';
  success = '';

  paiement = {
    montantPaiement: 0,
    modePaiement: 'especes'
  };

  resultatPaiement: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private factureService: FactureService,
    private clientsService: ClientsService
  ) {}

  ngOnInit(): void {
    this.clientId = this.route.snapshot.params['id'];
    this.chargerClient();
    this.chargerFacturesImpayees();
  }

  chargerClient(): void {
    this.clientsService.chercherClientById(this.clientId).subscribe({
      next: (data) => {
        this.client = data;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du client';
        console.error(err.message);
      }
    });
  }

  chargerFacturesImpayees(): void {
  this.loading = true;
  this.factureService.getAllFactures() // use findall
    .subscribe({
      next: (res: any) => {
        // Filter by clientId and statut in frontend
        this.factures = (res.factures || []).filter((f: any) =>
          f.client._id === this.clientId &&
          ['impayee', 'partiellement_payee'].includes(f.statut)
        );
        this.loading = false;
        this.client = this.factures.length > 0 ? this.factures[0].client : this.client;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des factures';
        console.error(err);
        this.loading = false;
      }
    });
}


  calculerTotalImpaye(): number {
    return this.factures.reduce((sum, f) => sum + f.soldeRestant, 0);
  }

  effectuerPaiement(): void {
    if (!this.paiement.montantPaiement || this.paiement.montantPaiement <= 0) {
      this.error = 'Le montant du paiement doit être supérieur à 0';
      return;
    }

    this.loadingPaiement = true;
    this.error = '';
    this.success = '';

    const paiementData = {
      client: this.clientId,
      montantPaiement: this.paiement.montantPaiement,
      modePaiement: this.paiement.modePaiement
    };

    this.factureService.effectuerPaiement(this.clientId, paiementData).subscribe({
      next: (data) => {
        this.resultatPaiement = data;
        this.success = 'Paiement effectué avec succès';
        this.loadingPaiement = false;
        
        // Recharger les données
        this.chargerClient();
        this.chargerFacturesImpayees();
        
        // Réinitialiser le formulaire
        this.paiement.montantPaiement = 0;
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors du paiement';
        console.error(err);
        this.loadingPaiement = false;
      }
    });
  }

  retour(): void {
    this.router.navigate(['/factures/list']);
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
}
