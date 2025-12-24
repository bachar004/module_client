import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Client {
  _id?: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: {
    rue?: string;
    ville?: string;
    codePostal?: string;
    pays?: string;
  };
  statut: string;
  soldeCompte?: number;
  dateCreation?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ClientsService {
  private apiUrl = 'http://localhost:3000/api/clients';

  constructor(private http: HttpClient) {}

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/findall`);
  }

  getClientById(id: string): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }

  ajouterClient(client: Client): Observable<Client> {
    return this.http.post<Client>(`${this.apiUrl}/add`, client);
  }

  modifierClient(id: string, client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/MAJ/${id}`, client);
  }

  supprimerClient(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }
  chercherClientById(id: string){
    return this.http.get(`${this.apiUrl}/chercher/${id}`);
  }
}