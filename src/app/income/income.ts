import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { LucideAngularModule, DollarSign, Calendar, Wallet, Plus, Trash2 } from 'lucide-angular';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
}

interface IncomeStream {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'bi-weekly' | 'weekly';
  accountId: string;
  accountName?: string;
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

  accounts: Account[] = [];
  incomeStreams: IncomeStream[] = [];

  showAddModal = false;
  newStreamName = '';
  newStreamAmount = 0;
  newStreamFrequency: 'monthly' | 'bi-weekly' | 'weekly' = 'monthly';
  newStreamAccountId = '';

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
      // For now, store income streams in localStorage
      const stored = localStorage.getItem('incomeStreams');
      if (stored) {
        this.incomeStreams = JSON.parse(stored);
        // Add account names
        this.incomeStreams.forEach(stream => {
          const account = this.accounts.find(a => a.id === stream.accountId);
          stream.accountName = account?.name || 'Unknown';
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  addIncomeStream() {
    if (!this.newStreamName || !this.newStreamAmount || !this.newStreamAccountId) {
      alert('Please fill in all fields');
      return;
    }

    const account = this.accounts.find(a => a.id === this.newStreamAccountId);
    const newStream: IncomeStream = {
      id: Date.now().toString(),
      name: this.newStreamName,
      amount: this.newStreamAmount,
      frequency: this.newStreamFrequency,
      accountId: this.newStreamAccountId,
      accountName: account?.name
    };

    this.incomeStreams.push(newStream);
    this.saveStreams();

    // Reset form
    this.newStreamName = '';
    this.newStreamAmount = 0;
    this.newStreamFrequency = 'monthly';
    this.newStreamAccountId = '';
    this.showAddModal = false;
  }

  deleteStream(id: string) {
    if (!confirm('Are you sure you want to delete this income stream?')) return;

    this.incomeStreams = this.incomeStreams.filter(s => s.id !== id);
    this.saveStreams();
  }

  saveStreams() {
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

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
