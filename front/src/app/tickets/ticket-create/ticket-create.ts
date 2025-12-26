import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TicketService } from '../../../services/ticket.service';
import { ClientService } from '../../../client-service';

@Component({
    selector: 'app-ticket-create',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './ticket-create.html'
})
export class TicketCreateComponent implements OnInit {
    ticket: any = {
        titre: '',
        description: '',
        clientId: '' // User must select a client for now
    };
    clients: any[] = [];
    submitting = false;

    constructor(
        private ticketService: TicketService,
        private clientService: ClientService,
        private router: Router
    ) { }

    ngOnInit(): void {
        // Load clients to populate the dropdown
        this.clientService.listclient().subscribe({
            next: (data: any) => {
                this.clients = data;
            },
            error: (e) => console.error(e)
        });
    }

    onSubmit() {
        if (!this.ticket.clientId || !this.ticket.titre || !this.ticket.description) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return;
        }

        this.submitting = true;
        this.ticketService.createTicket(this.ticket).subscribe({
            next: (res) => {
                this.submitting = false;
                alert('Ticket créé avec succès ! Référence: ' + res.reference);
                this.router.navigate(['/tickets/list']);
            },
            error: (e) => {
                this.submitting = false;
                console.error(e);
                alert('Erreur lors de la création du ticket.');
            }
        });
    }
}
