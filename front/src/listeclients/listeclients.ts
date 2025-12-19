import { Component, OnInit } from '@angular/core';
import { ClientService } from '../client-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, pipe, Subject } from 'rxjs';

interface Adresse {
  rue: string;
  ville: string;
  codePostal: string;
  pays: string;
}

interface HistoriqueModification {
  date: string;
  champ: string;
  ancienneValeur: string;
  nouvelleValeur: string;
}

interface Client {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  statut: 'actif' | 'inactif' | 'suspendu';
  dateCreation: string;
  soldeCompte: number;
  adresse: Adresse;
  historiqueModifications: HistoriqueModification[];
}

@Component({
  selector: 'app-listeclients',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './listeclients.html',
  styleUrl: './listeclients.css'
})
export class Listeclients implements OnInit {
  clients: Client[] = [];
  search: string = '';
  private searchSubject = new Subject<string>();
  selectedClient: Client | null = null;
  clientHistoriqueId: string | null = null;
  
  // Mode édition
  isEditMode: boolean = false;
  clientForm!: FormGroup;
  isSaving: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private clientService: ClientService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.loadClients();
        this.searchSubject.pipe(
      debounceTime(300),       // attendre 300ms après la dernière frappe
      distinctUntilChanged()   // ignorer si la valeur n'a pas changé
    ).subscribe(query => {
      this.clientService.chercherclient(query).subscribe({
        next:(data:any) => {
          this.clients = data
        },
        error:(err)=> {
            console.log(err.message)
        },
      }
      );
    });
  }
    onSearchChange(value: string) {
    this.searchSubject.next(value);
  }

  initForm(): void {
    this.clientForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9]{8,}$/)]],
      statut: ['actif', Validators.required],
      soldeCompte: [0, [Validators.required, Validators.min(0)]],
      adresse: this.fb.group({
        rue: ['', Validators.required],
        ville: ['', Validators.required],
        codePostal: ['', Validators.required],
        pays: ['Tunisie', Validators.required]
      })
    });
  }

  loadClients(): void {
    this.clientService.listclient().subscribe({
      next: (data:any) => {
        this.clients = data;
        console.log(' Clients chargés:', this.clients);
      },
      error: (err: any) => {
        console.error('Erreur chargement clients:', err);
      },
    });
  }

  // Ouvrir le modal en mode LECTURE
  openDetails(client: Client): void {
    this.selectedClient = client;
    this.isEditMode = false;
    this.errorMessage = '';
    this.successMessage = '';
    console.log(' Ouverture détails pour:', client.nom, client.prenom);
  }

  // Passer en mode ÉDITION
  switchToEditMode(): void {
    if (this.selectedClient) {
      this.isEditMode = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      // Pré-remplir le formulaire
      this.clientForm.patchValue({
        nom: this.selectedClient.nom,
        prenom: this.selectedClient.prenom,
        email: this.selectedClient.email,
        telephone: this.selectedClient.telephone,
        statut: this.selectedClient.statut,
        soldeCompte: this.selectedClient.soldeCompte,
        adresse: {
          rue: this.selectedClient.adresse?.rue || '',
          ville: this.selectedClient.adresse?.ville || '',
          codePostal: this.selectedClient.adresse?.codePostal || '',
          pays: this.selectedClient.adresse?.pays || 'Tunisie'
        }
      });
      
      console.log(' Mode édition activé');
    }
  }

  // Annuler l'édition
  cancelEdit(): void {
    this.isEditMode = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.clientForm.reset();
  }

  // Sauvegarder les modifications
  saveClient(): void {
    if (this.clientForm.invalid) {
      this.markFormGroupTouched(this.clientForm);
      return;
    }

    if (!this.selectedClient) return;

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = this.clientForm.value;

    this.clientService.updateClient(this.selectedClient._id, formData).subscribe({
      next: (updatedClient:any) => {
        console.log(' Client mis à jour:', updatedClient);
        
        // Mettre à jour le client dans la liste
        const index = this.clients.findIndex(c => c._id === updatedClient._id);
        if (index !== -1) {
          this.clients[index] = updatedClient;
        }
        
        // Mettre à jour le client sélectionné
        this.selectedClient = updatedClient;
        
        this.successMessage = 'Client modifié avec succès !';
        this.isSaving = false;
        this.isEditMode = false;
        
        // Fermer le modal après 2 secondes
        setTimeout(() => {
          this.closeModal();
        }, 2000);
      },
      error: (err) => {
        console.error(' Erreur mise à jour:', err);
        this.errorMessage = err.error?.message || 'Erreur lors de la mise à jour';
        this.isSaving = false;
      }
    });
  }

  // Fermer le modal
  closeModal(): void {
    this.selectedClient = null;
    this.isEditMode = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.clientForm.reset();
  }

  // Toggle historique dans le tableau
  toggleHistorique(client: Client, event: Event): void {
    event.stopPropagation();
    
    if (this.clientHistoriqueId === client._id) {
      this.clientHistoriqueId = null;
    } else {
      this.clientHistoriqueId = client._id;
    }
  }

  // Vérifier si l'historique est ouvert
  isHistoriqueOpen(clientId: string): boolean {
    return this.clientHistoriqueId === clientId;
  }

  // Filtrer les clients
  get filteredClients(): Client[] {
    if (!this.search.trim()) {
      return this.clients;
    }

    const searchLower = this.search.toLowerCase();
    return this.clients.filter(client =>
      client.nom.toLowerCase().includes(searchLower) ||
      client.prenom.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower) ||
      client.telephone.includes(this.search)
    );
  }

  // Classe CSS du statut
  getStatutClass(statut: string): string {
    switch(statut) {
      case 'actif': return 'bg-success';
      case 'inactif': return 'bg-warning text-dark';
      case 'suspendu': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  // Helper pour marquer tous les champs comme touchés
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Getters pour les contrôles du formulaire
  get nom() { return this.clientForm.get('nom'); }
  get prenom() { return this.clientForm.get('prenom'); }
  get email() { return this.clientForm.get('email'); }
  get telephone() { return this.clientForm.get('telephone'); }
  get statut() { return this.clientForm.get('statut'); }
  get soldeCompte() { return this.clientForm.get('soldeCompte'); }
  get adresse() { return this.clientForm.get('adresse') as FormGroup; }
}