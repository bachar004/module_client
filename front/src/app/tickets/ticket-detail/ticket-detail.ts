import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TicketService } from '../../../services/ticket.service';

@Component({
    selector: 'app-ticket-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './ticket-detail.html',
    styles: [`
    .timeline { list-style: none; padding: 0; }
    .timeline-item { border-left: 2px solid #dee2e6; padding-left: 1rem; margin-bottom: 1rem; position: relative; }
    .timeline-item::before { content: ''; position: absolute; left: -5px; top: 0; width: 10px; height: 10px; border-radius: 50%; background: #0d6efd; }
    .comment-box { border: 1px solid #e9ecef; border-radius: 8px; padding: 10px; margin-bottom: 10px; }
    .bg-internal { background-color: #fff3cd; border-color: #ffecb5; } /* Jaune pâle pour interne */
  `]
})
export class TicketDetailComponent implements OnInit {
    ticket: any = null;
    loading = true;
    newComment = '';
    commentType = 'EXTERNAL'; // Default to external
    agentName = ''; // For assignment input

    constructor(
        private route: ActivatedRoute,
        private ticketService: TicketService,
        private router: Router
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadTicket(id);
        }
    }

    loadTicket(id: string) {
        this.loading = true;
        this.ticketService.getTicketById(id).subscribe({
            next: (data) => {
                this.ticket = data;
                this.loading = false;
            },
            error: (e) => {
                console.error(e);
                this.loading = false;
                alert('Erreur: Ticket introuvable');
                this.router.navigate(['/tickets/list']);
            }
        });
    }

    assignAgent() {
        if (!this.agentName) return;
        this.ticketService.assignAgent(this.ticket._id, this.agentName).subscribe({
            next: (updatedTicket) => {
                this.ticket = updatedTicket;
                this.agentName = '';
                alert('Agent assigné avec succès');
            },
            error: (e) => console.error(e)
        });
    }

    updateStatus(newStatus: string) {
        if (!this.ticket.agent) {
            alert('Veuillez assigner un agent avant de changer le statut du ticket.');
            return;
        }

        // Logic: If resolving, verify conditions (mocked here by just confirming)
        if (!confirm(`Voulez-vous vraiment passer le statut à ${newStatus} ?`)) return;

        this.ticketService.updateStatus(this.ticket._id, newStatus, 'CurrentUser', `Statut changé manuellement`).subscribe({
            next: (updatedTicket) => {
                this.ticket = updatedTicket;
            },
            error: (e) => console.error(e)
        });
    }

    addComment() {
        if (!this.newComment) return;

        const commentData = {
            user: 'CurrentUser', // Mocked user
            content: this.newComment,
            type: this.commentType,
            attachments: [] // Not implemented for now
        };

        this.ticketService.addComment(this.ticket._id, commentData).subscribe({
            next: (updatedTicket) => {
                this.ticket = updatedTicket;
                this.newComment = '';
            },
            error: (e) => console.error(e)
        });
    }

    // Helper for UI
    getStatusClass(status: string): string {
        switch (status) {
            case 'OUVERT': return 'bg-primary';
            case 'EN_COURS': return 'bg-warning text-dark';
            case 'RESOLU': return 'bg-success';
            case 'CLOS': return 'bg-danger';
            default: return 'bg-secondary';
        }
    }
}
