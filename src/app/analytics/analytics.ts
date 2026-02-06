import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';

Chart.register(...registerables);

interface Transaction {
  id: string;
  description?: string;
  amount: number;
  category?: string;
  date: Date;
  type: 'income' | 'expense';
}

@Component({
  selector: 'app-analytics',
  imports: [CommonModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.scss',
})
export class AnalyticsComponent implements OnInit {
  transactions: Transaction[] = [];
  monthlyBudget = 2000;

  private categoryChart: Chart | null = null;
  private trendChart: Chart | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) { }

  async ngOnInit() {
    await this.loadData();
    setTimeout(() => {
      this.initCharts();
    }, 100);
  }

  async loadData() {
    try {
      this.transactions = await this.apiService.getTransactions(50);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  initCharts() {
    this.initCategoryChart();
    this.initTrendChart();
  }

  initCategoryChart() {
    const canvas = document.getElementById('categoryChart') as HTMLCanvasElement;
    if (!canvas) return;

    const categoryData: { [key: string]: number } = {};
    this.transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const category = t.category || 'Other';
        categoryData[category] = (categoryData[category] || 0) + Math.abs(t.amount);
      });

    const labels = Object.keys(categoryData);
    const data = Object.values(categoryData);

    this.categoryChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            '#0891B2',
            '#10B981',
            '#F59E0B',
            '#F43F5E',
            '#3B82F6',
            '#8B5CF6'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: {
                family: 'DM Sans',
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                return `${label}: $${value.toFixed(2)}`;
              }
            }
          }
        }
      }
    });
  }

  initTrendChart() {
    const canvas = document.getElementById('trendChart') as HTMLCanvasElement;
    if (!canvas) return;

    const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
    const expenseData = [1800, 2100, 1950, 2300, 1900, 2050];
    const budgetData = months.map(() => this.monthlyBudget);

    this.trendChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Monthly Budget',
            data: budgetData,
            borderColor: '#0891B2',
            borderDash: [5, 5],
            backgroundColor: 'transparent',
            pointRadius: 0,
            tension: 0,
            fill: false
          },
          {
            label: 'Actual Spending',
            data: expenseData,
            borderColor: '#F43F5E',
            backgroundColor: 'rgba(244, 63, 94, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              padding: 15,
              font: {
                family: 'DM Sans',
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const value = context.parsed.y || 0;
                return `${label}: $${value.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => '$' + value
            }
          }
        }
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  ngOnDestroy() {
    if (this.categoryChart) {
      this.categoryChart.destroy();
    }
    if (this.trendChart) {
      this.trendChart.destroy();
    }
  }
}
