import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { LucideAngularModule, Receipt, Calendar, Filter, Plus, Trash2, Edit, ArrowDownRight } from 'lucide-angular';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
}

interface Transaction {
  id: string;
  description?: string;
  amount: number;
  category?: string;
  date: Date;
  type: 'income' | 'expense';
  accountId?: string;
}

@Component({
  selector: 'app-expenses',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './expenses.html',
  styleUrl: './expenses.scss',
})
export class ExpensesComponent implements OnInit {
  readonly Receipt = Receipt;
  readonly Calendar = Calendar;
  readonly Filter = Filter;
  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  readonly Edit = Edit;
  readonly ArrowDownRight = ArrowDownRight;

  accounts: Account[] = [];
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  expenses: Transaction[] = [];

  // Filters
  selectedAccountId = '';
  selectedCategory = '';
  dateFrom = '';
  dateTo = '';

  // Categories
  categories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Shopping', 'Health', 'Transfer', 'Other'];

  isLoading = false;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) { }

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.isLoading = true;
    try {
      this.accounts = await this.apiService.getAccounts();
      this.transactions = await this.apiService.getTransactions(100);
      // Filter to only expenses (negative amounts or type === 'expense')
      this.expenses = this.transactions.filter(t => t.amount < 0 || t.type === 'expense');
      this.applyFilters();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  applyFilters() {
    this.filteredTransactions = this.expenses.filter(t => {
      // Account filter
      if (this.selectedAccountId && (t as any).accountId !== this.selectedAccountId) {
        return false;
      }
      // Category filter
      if (this.selectedCategory && t.category !== this.selectedCategory) {
        return false;
      }
      // Date range filter
      if (this.dateFrom) {
        const from = new Date(this.dateFrom);
        if (new Date(t.date) < from) return false;
      }
      if (this.dateTo) {
        const to = new Date(this.dateTo);
        to.setHours(23, 59, 59);
        if (new Date(t.date) > to) return false;
      }
      return true;
    });
  }

  clearFilters() {
    this.selectedAccountId = '';
    this.selectedCategory = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.applyFilters();
  }

  getTotalExpenses(): number {
    return this.filteredTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  getAccountName(accountId?: string): string {
    if (!accountId) return 'Unknown';
    const account = this.accounts.find(a => a.id === accountId);
    return account?.name || 'Unknown';
  }

  async deleteTransaction(id: string) {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      await this.apiService.deleteTransaction(id);
      await this.loadData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete. Please try again.');
    }
  }
}
