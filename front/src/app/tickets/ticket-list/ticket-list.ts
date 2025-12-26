import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TicketService } from '../../../services/ticket.service';

@Component({
    selector: 'app-ticket-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './ticket-list.html',
    styles: [`
    .status-badge {
      padding: 0.25em 0.6em;
      border-radius: 4px;
      font-size: 0.85em;
      font-weight: bold;
    }
    .status-OUVERT { background-color: #e3f2fd; color: #0d47a1; }
    .status-EN_COURS { background-color: #fff3e0; color: #e65100; }
    .status-RESOLU { background-color: #e8f5e9; color: #1b5e20; }
    .status-CLOS { background-color: #ffebee; color: #b71c1c; }
    .status-ARCHIVE { background-color: #f5f5f5; color: #616161; }
  `]
})
export class TicketListComponent implements OnInit {
    tickets: any[] = [];
    loading = true;
    searchTerm: string = '';
    statusFilter: string = '';

    constructor(private ticketService: TicketService) { }

    ngOnInit(): void {
        this.loadTickets();
    }

    loadTickets() {
        this.ticketService.getAllTickets().subscribe({
            next: (data) => {
                this.tickets = data;
                this.loading = false;
            },
            error: (e) => {
                console.error(e);
                this.loading = false;
            }
        });
    }

    get filteredTickets() {
        return this.tickets.filter(ticket => {
            const matchesSearch = !this.searchTerm ||
                (ticket.client && (ticket.client.nom + ' ' + ticket.client.prenom).toLowerCase().includes(this.searchTerm.toLowerCase())) ||
                ticket.reference.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                ticket.titre.toLowerCase().includes(this.searchTerm.toLowerCase());

            const matchesStatus = !this.statusFilter || ticket.statut === this.statusFilter;

            return matchesSearch && matchesStatus;
        });
    }
}
