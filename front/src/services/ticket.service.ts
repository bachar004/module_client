import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TicketService {
    private url = "http://localhost:3000/api/tickets";

    constructor(private http: HttpClient) { }

    // Lister tous les tickets
    getAllTickets(): Observable<any> {
        return this.http.get(this.url);
    }

    // Lister les tickets d'un client
    getClientTickets(clientId: string): Observable<any> {
        return this.http.get(`${this.url}/client/${clientId}`);
    }

    // Détails d'un ticket
    getTicketById(id: string): Observable<any> {
        return this.http.get(`${this.url}/${id}`);
    }

    // Créer un ticket
    createTicket(ticket: any): Observable<any> {
        return this.http.post(this.url, ticket);
    }

    // Assigner un agent
    assignAgent(id: string, agent: string): Observable<any> {
        return this.http.put(`${this.url}/${id}/assign`, { agent });
    }

    // Changer le statut
    updateStatus(id: string, status: string, user: string, details: string): Observable<any> {
        return this.http.put(`${this.url}/${id}/status`, { statut: status, user, details });
    }

    // Ajouter un commentaire
    addComment(id: string, comment: any): Observable<any> {
        return this.http.post(`${this.url}/${id}/comments`, comment);
    }

    // Obtenir les stats
    getStats(): Observable<any> {
        return this.http.get(`${this.url}/stats/dashboard`);
    }
}
