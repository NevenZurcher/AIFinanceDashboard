import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, IncomeStream } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { LucideAngularModule, DollarSign, Calendar, Wallet, Plus, Trash2, Edit } from 'lucide-angular';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
}

@Component({
  selector: 'app-income',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './income.html',
  styleUrl: './income.scss',
})
export class IncomeComponent implements OnInit {
  readonly DollarSign = DollarSign;
  readonly Calendar = Calendar;
  readonly Wallet = Wallet;
  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  readonly Edit = Edit;

  accounts: Account[] = [];
  incomeStreams: IncomeStream[] = [];

  showAddModal = false;
  showEditModal = false;
  editingStream: Partial<IncomeStream> = { id: '', name: '', amount: 0, frequency: 'monthly', accountId: '' };
  newStreamName = '';
  newStreamAmount = 0;
  newStreamFrequency: string = 'monthly';
  newStreamAccountId = '';

  isLoading = false;
  useLocalStorage = false; // Will be set to true if API fails

  constructor(
    private apiService: ApiService,
    private router: Router
  ) { }

  async ngOnInit() {
    // Wait for auth to be ready
    this.apiService['authService'].user$.subscribe((user: any) => {
      if (user) {
        this.loadData();
      }
    });
  }

  async loadData() {
    this.isLoading = true;

    try {
      // Try to load from API first
      this.accounts = await this.apiService.getAccounts();

      try {
        this.incomeStreams = await this.apiService.getIncomeStreams();
        this.useLocalStorage = false;
      } catch (apiError) {
        // API for income streams not available, fallback to localStorage
        console.warn('Income API not available, using localStorage:', apiError);
        this.useLocalStorage = true;
        const stored = localStorage.getItem('incomeStreams');
        if (stored) {
          this.incomeStreams = JSON.parse(stored);
        }
      }

      // Update account names for all streams
      this.incomeStreams.forEach(stream => {
        const account = this.accounts.find(a => a.id === stream.accountId);
        stream.accountName = account?.name || 'Unknown';
      });
    } catch (error: any) {
      console.error('Error loading data:', error);
      alert('Failed to load income data: ' + (error.message || error));
      // Fallback to localStorage for income streams
      this.useLocalStorage = true;
      const stored = localStorage.getItem('incomeStreams');
      if (stored) {
        this.incomeStreams = JSON.parse(stored);
      }
    } finally {
      this.isLoading = false;
    }
  }

  async addIncomeStream() {
    if (!this.newStreamName || !this.newStreamAmount || !this.newStreamAccountId) {
      alert('Please fill in all fields');
      return;
    }
    if (this.newStreamAmount < 0) {
      alert('Income amount cannot be negative');
      return;
    }

    this.isLoading = true;
    const account = this.accounts.find(a => a.id === this.newStreamAccountId);

    try {
      if (this.useLocalStorage) {
        // Fallback to localStorage
        const now = new Date();
        const newStream: IncomeStream = {
          id: Date.now().toString(),
          name: this.newStreamName,
          amount: this.newStreamAmount,
          frequency: this.newStreamFrequency,
          accountId: this.newStreamAccountId,
          accountName: account?.name
        };
        this.incomeStreams.push(newStream);
        this.saveToLocalStorage();
      } else {
        // Use API
        const newStream = await this.apiService.createIncomeStream({
          name: this.newStreamName,
          amount: this.newStreamAmount,
          frequency: this.newStreamFrequency,
          accountId: this.newStreamAccountId
        });
        newStream.accountName = account?.name;
        this.incomeStreams.push(newStream);
      }

      // Reset form
      this.newStreamName = '';
      this.newStreamAmount = 0;
      this.newStreamFrequency = 'monthly';
      // this.calculateMonthlyTotal(); // Method missing, removed
      this.isLoading = false;
    } catch (error: any) {
      console.error('Error adding income stream:', error);
      alert('Failed to add income stream: ' + (error.message || error));
    } finally {
      this.isLoading = false;
    }
  }

  async deleteStream(id: string) {
    if (!confirm('Are you sure you want to delete this income stream?')) return;

    this.isLoading = true;
    try {
      if (this.useLocalStorage) {
        this.incomeStreams = this.incomeStreams.filter(s => s.id !== id);
        this.saveToLocalStorage();
      } else {
        await this.apiService.deleteIncomeStream(id);
        this.incomeStreams = this.incomeStreams.filter(s => s.id !== id);
      }
    } catch (error) {
      console.error('Error deleting income stream:', error);
      alert('Failed to delete. Please try again.');
    } finally {
      this.isLoading = false;
    }
  }

  editStream(stream: IncomeStream) {
    this.editingStream = { ...stream };
    this.showEditModal = true;
  }

  async saveEditedStream() {
    if (!this.editingStream.name || !this.editingStream.amount || !this.editingStream.accountId) {
      alert('Please fill in all fields');
      return;
    }
    if (this.editingStream.amount! < 0) {
      alert('Income amount cannot be negative');
      return;
    }

    this.isLoading = true;
    const account = this.accounts.find(a => a.id === this.editingStream.accountId);

    try {
      if (this.useLocalStorage) {
        const index = this.incomeStreams.findIndex(s => s.id === this.editingStream.id);
        if (index !== -1) {
          this.editingStream.accountName = account?.name;
          this.incomeStreams[index] = { ...this.editingStream } as IncomeStream;
          this.saveToLocalStorage();
        }
      } else {
        const updatedStream = await this.apiService.updateIncomeStream(this.editingStream.id!, {
          name: this.editingStream.name,
          amount: this.editingStream.amount,
          frequency: this.editingStream.frequency,
          accountId: this.editingStream.accountId
        });
        updatedStream.accountName = account?.name;
        const index = this.incomeStreams.findIndex(s => s.id === this.editingStream.id);
        if (index !== -1) {
          this.incomeStreams[index] = updatedStream;
        }
      }
      this.showEditModal = false;
    } catch (error) {
      console.error('Error updating income stream:', error);
      alert('Failed to update. Please try again.');
    } finally {
      this.isLoading = false;
    }
  }

  saveToLocalStorage() {
    localStorage.setItem('incomeStreams', JSON.stringify(this.incomeStreams));
  }

  getTotalMonthlyIncome(): number {
    return this.incomeStreams.reduce((sum, stream) => {
      let monthlyAmount = stream.amount;
      if (stream.frequency === 'bi-weekly') {
        monthlyAmount = stream.amount * 2;
      } else if (stream.frequency === 'weekly') {
        monthlyAmount = stream.amount * 4;
      }
      return sum + monthlyAmount;
    }, 0);
  }

  formatDate(dateString?: string | Date): string {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  }

  getDaysUntilNextDeposit(nextDepositDate?: string | Date): number {
    if (!nextDepositDate) return 0;
    const now = new Date();
    const next = new Date(nextDepositDate);
    const diff = next.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
