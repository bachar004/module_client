import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FactureService {
  private apiUrl = 'http://localhost:3000/api/factures'; // Ajustez l'URL selon votre configuration

  constructor(private http: HttpClient) {}

  // Récupérer toutes les factures avec filtre optionnel
  getAllFactures(statut?: string): Observable<any> {
    let params = new HttpParams();
    if (statut) {
      params = params.set('statut', statut);
    }
    return this.http.get(`${this.apiUrl}/findall`, { params });
  }

  // Récupérer une facture par ID
  getFactureById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Effectuer un paiement
  effectuerPaiement(clientId: string, paiementData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/paiements/${clientId}`, paiementData);
  }

  // Récupérer les factures d'un client
  getFacturesClient(clientId: string, statut?: string, filters?: any): Observable<any> {
    let params = new HttpParams();
    
    if (statut) {
      params = params.set('statut', statut);
    }
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }
    
    return this.http.get(`${this.apiUrl}/client/${clientId}/factures`, { params });
  }

  // Récupérer les paiements d'un client
  getPaiementsClient(clientId: string, filters?: any): Observable<any> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }
    
    return this.http.get(`${this.apiUrl}/client/${clientId}/paiements`, { params });
  }
  appliquerFiltres(filters: any): Observable<any> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    });
    return this.http.get(`${this.apiUrl}/findall`, { params });
  }
  // Add these methods to your FactureService

  getAllPaiements(params: any = {}): Observable<any> {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key].toString());
      }
    });
    
    const queryString = queryParams.toString();
    const url = queryString 
      ? `${this.apiUrl}/paiements/findall?${queryString}`
      : `${this.apiUrl}/paiements/findall`;
      
    return this.http.get<any>(url);
  }

  getPaiementById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/paiements/${id}`);
  }
  getPaiementsFacture(factureId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${factureId}/paiements`);
  }
}