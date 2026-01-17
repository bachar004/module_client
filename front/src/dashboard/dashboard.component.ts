import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DashboardService, DashboardData } from './services/dashboard.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  dashboardData: DashboardData | null = null;
  loading = true;
  error: string | null = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = null;

    this.dashboardService.getDashboardStats().subscribe({
      next: (response) => {
        console.log('Dashboard data received:', response);
        this.dashboardData = response.data;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.error = 'Erreur lors du chargement du tableau de bord';
        this.loading = false;
      }
    });
  }

  calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(amount);
  }

  getThisMonthRevenue(): number {
    return this.dashboardData?.monthlyComparison.thisMonth.revenue?.[0]?.total ?? 0;
  }

  getLastMonthRevenue(): number {
    return this.dashboardData?.monthlyComparison.lastMonth.revenue?.[0]?.total ?? 0;
  }
}
