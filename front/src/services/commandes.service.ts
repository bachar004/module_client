import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Article {
  produit: string;
  quantite: number;
  prixUnitaire: number;
  total?: number;
}

export interface Commande {
  _id?: string;
  numeroCommande?: string;
  client: any;
  dateCommande?: Date;
  articles: Article[];
  montantTotal: number;
  statut: string;
  raisonAnnulation?: string;
  dateValidation?: Date;
  dateAnnulation?: Date;
  notes?: string;
}

export interface CommandeStats {
  totalCommandes: number;
  commandesEnAttente: number;
  commandesValidees: number;
  commandesAnnulees: number;
  montantTotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class CommandesService {
  private apiUrl = 'http://localhost:3000/api/commandes';

  constructor(private http: HttpClient) {}

  // Créer une commande
  creerCommande(commande: Partial<Commande>): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, commande);
  }

  // Récupérer toutes les commandes
  getCommandes(statut?: string): Observable<Commande[]> {
    let url = `${this.apiUrl}/findall`;
    if (statut) {
      url += `?statut=${statut}`;
    }
    return this.http.get<Commande[]>(url);
  }

  // Récupérer une commande par ID
  getCommandeById(id: string): Observable<Commande> {
    return this.http.get<Commande>(`${this.apiUrl}/${id}`);
  }

  // Valider une commande
  validerCommande(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/valider/${id}`, {});
  }

  // Annuler une commande
  annulerCommande(id: string, raison: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/annuler/${id}`, { 
      raisonAnnulation: raison 
    });
  }

  // Mettre à jour le statut
  updateStatut(id: string, statut: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/statut/${id}`, { statut });
  }

  // Supprimer une commande
  supprimerCommande(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }

  // Statistiques
  getStatistiques(): Observable<CommandeStats> {
    return this.http.get<CommandeStats>(`${this.apiUrl}/stats/overview`);
  }
}