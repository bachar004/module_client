import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/* ===== MONTH STATS ===== */
export interface MonthlyRevenue {
  total: number;
}

export interface MonthlyStats {
  newClients: number;
  newOrders: number;
  revenue: MonthlyRevenue[]; // ✅ REQUIRED
}

/* ===== TOP CLIENT ===== */
export interface TopClient {
  clientInfo: {
    nom: string;
    prenom: string;
  };
  totalRevenue: number;
  orderCount: number;
  lastOrder: {
    dateCommande: string;
  }[];
}

/* ===== DASHBOARD DATA ===== */
export interface DashboardData {
  metrics: {
    activeClients: number;
    pendingOrders: number;
    totalRevenue: number;
    unpaidInvoices: {
      count: number;
      amount: number;
    };
  };

  alerts: {
    overdueInvoices: number;
    openTickets: number;
    ordersAwaitingValidation: number;
  };

  topClients: TopClient[];

  monthlyComparison: {
    thisMonth: MonthlyStats;
    lastMonth: MonthlyStats;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = 'http://localhost:3000/api/dashboard';

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<{ success: boolean; data: DashboardData }> {
    return this.http.get<{ success: boolean; data: DashboardData }>(
      `${this.apiUrl}/stats`
    );
  }
}
