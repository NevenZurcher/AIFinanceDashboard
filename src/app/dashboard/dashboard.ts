import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { LucideAngularModule, TrendingUp, ArrowUpRight, ArrowDownRight, Target, Sparkles, ArrowUp, ArrowDown, Building2, Wallet, CreditCard, BarChart3, CheckCircle, AlertTriangle, Info } from 'lucide-angular';

Chart.register(...registerables);

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
  type: 'income' | 'expense';
}

interface AIInsight {
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info';
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  // Lucide Icons
  readonly TrendingUp = TrendingUp;
  readonly ArrowUpRight = ArrowUpRight;
  readonly ArrowDownRight = ArrowDownRight;
  readonly Target = Target;
  readonly Sparkles = Sparkles;
  readonly ArrowUp = ArrowUp;
  readonly ArrowDown = ArrowDown;
  readonly Building2 = Building2;
  readonly Wallet = Wallet;
  readonly CreditCard = CreditCard;
  readonly BarChart3 = BarChart3;
  readonly CheckCircle = CheckCircle;
  readonly AlertTriangle = AlertTriangle;
  readonly Info = Info;

  // Mock data - will be replaced with real API calls
  accounts: Account[] = [
    { id: '1', name: 'Checking Account', type: 'checking', balance: 5420.50 },
    { id: '2', name: 'Savings Account', type: 'savings', balance: 12350.00 },
    { id: '3', name: 'Credit Card', type: 'credit', balance: -1250.75 }
  ];

  transactions: Transaction[] = [
    { id: '1', description: 'Salary Deposit', amount: 5000, category: 'Income', date: new Date('2026-01-15'), type: 'income' },
    { id: '2', description: 'Rent Payment', amount: -1500, category: 'Housing', date: new Date('2026-01-14'), type: 'expense' },
    { id: '3', description: 'Grocery Shopping', amount: -250.50, category: 'Food', date: new Date('2026-01-13'), type: 'expense' },
    { id: '4', description: 'Gas Station', amount: -45.20, category: 'Transportation', date: new Date('2026-01-12'), type: 'expense' },
    { id: '5', description: 'Restaurant', amount: -85.00, category: 'Food', date: new Date('2026-01-11'), type: 'expense' },
    { id: '6', description: 'Online Shopping', amount: -120.30, category: 'Shopping', date: new Date('2026-01-10'), type: 'expense' },
    { id: '7', description: 'Freelance Work', amount: 800, category: 'Income', date: new Date('2026-01-09'), type: 'income' },
    { id: '8', description: 'Electricity Bill', amount: -95.00, category: 'Utilities', date: new Date('2026-01-08'), type: 'expense' }
  ];

  aiInsights: AIInsight[] = [
    {
      title: 'Great Savings Rate!',
      description: 'You\'re saving 35% of your income this month. Keep up the excellent work!',
      type: 'success'
    },
    {
      title: 'Food Spending Alert',
      description: 'Your food expenses are 20% higher than last month. Consider meal planning to reduce costs.',
      type: 'warning'
    },
    {
      title: 'Investment Opportunity',
      description: 'Based on your savings pattern, you could invest $500/month in a low-risk index fund.',
      type: 'info'
    }
  ];

  // Computed values
  totalBalance = 0;
  monthlyIncome = 0;
  monthlyExpenses = 0;
  savingsRate = 0;

  // Charts
  private categoryChart: Chart | null = null;
  private trendChart: Chart | null = null;

  ngOnInit() {
    this.calculateSummary();
    setTimeout(() => {
      this.initCharts();
    }, 100);
  }

  calculateSummary() {
    this.totalBalance = this.accounts.reduce((sum, acc) => sum + acc.balance, 0);

    const currentMonth = new Date().getMonth();
    const currentMonthTransactions = this.transactions.filter(t => t.date.getMonth() === currentMonth);

    this.monthlyIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    this.monthlyExpenses = Math.abs(currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0));

    this.savingsRate = this.monthlyIncome > 0
      ? ((this.monthlyIncome - this.monthlyExpenses) / this.monthlyIncome) * 100
      : 0;
  }

  initCharts() {
    this.initCategoryChart();
    this.initTrendChart();
  }

  initCategoryChart() {
    const canvas = document.getElementById('categoryChart') as HTMLCanvasElement;
    if (!canvas) return;

    // Group expenses by category
    const categoryData: { [key: string]: number } = {};
    this.transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryData[t.category] = (categoryData[t.category] || 0) + Math.abs(t.amount);
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

    // Mock monthly data for the last 6 months
    const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
    const incomeData = [4800, 5200, 5000, 5100, 5300, 5800];
    const expenseData = [3200, 3400, 3100, 3300, 3500, 3200];

    this.trendChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Income',
            data: incomeData,
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Expenses',
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

  ngOnDestroy() {
    if (this.categoryChart) {
      this.categoryChart.destroy();
    }
    if (this.trendChart) {
      this.trendChart.destroy();
    }
  }
}
