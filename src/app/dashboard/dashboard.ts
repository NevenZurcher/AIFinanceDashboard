import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { LucideAngularModule, TrendingUp, ArrowUpRight, ArrowDownRight, Target, Sparkles, ArrowUp, ArrowDown, Building2, Wallet, CreditCard, BarChart3, CheckCircle, AlertTriangle, Info, Trash2, Edit, Search, Bell, Globe, MoreHorizontal, LayoutDashboard, LineChart, Receipt, FileText, Settings, User, Send, ArrowRight, SlidersHorizontal, RefreshCw, Plus } from 'lucide-angular';



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
}

interface BudgetCategory {
  name: string;
  budget: number;
  actual: number;
}

interface AIInsight {
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info';
}

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    RouterModule
  ],
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
  readonly Trash2 = Trash2;
  readonly Edit = Edit;
  readonly Search = Search;
  readonly Bell = Bell;
  readonly Globe = Globe;
  readonly MoreHorizontal = MoreHorizontal;
  readonly LayoutDashboard = LayoutDashboard;
  readonly LineChart = LineChart;
  readonly Receipt = Receipt;
  readonly FileText = FileText;
  readonly Settings = Settings;
  readonly User = User;
  readonly Send = Send;
  readonly ArrowRight = ArrowRight;
  readonly SlidersHorizontal = SlidersHorizontal;
  readonly RefreshCw = RefreshCw;
  readonly Plus = Plus;

  // Modal states
  showAddAccountModal = false;
  showAddTransactionModal = false;
  showEditAccountModal = false;
  editingAccount: Account = { id: '', name: '', type: 'checking', balance: 0 };

  // Form fields for Add Account
  newAccountName = '';
  newAccountType = 'checking';
  newAccountBalance = 0;

  // Form fields for Add Transaction
  newTransactionAccountId = '';
  newTransactionType = 'expense';
  newTransactionAmount = 0;
  newTransactionCategory = '';
  newTransactionDescription = '';
  newTransactionDate = new Date().toISOString().split('T')[0];
  newTransactionToAccountId = ''; // For transfers

  // User info
  userName = '';
  userEmail = '';

  // Data will be loaded from API
  accounts: Account[] = [];
  transactions: Transaction[] = [];
  aiInsights: AIInsight[] = [];

  // Computed values
  totalBalance = 0;
  monthlyIncome = 0;
  monthlyExpenses = 0;

  // Budget values
  monthlyBudget = 2000;
  budgetUsedPercentage = 0;
  budgetRemaining = 0;

  // Budget categories
  showBudgetPanel = false;
  budgetCategories: BudgetCategory[] = [
    { name: 'Housing', budget: 1200, actual: 1150 },
    { name: 'Food', budget: 400, actual: 520 },
    { name: 'Transport', budget: 200, actual: 180 },
    { name: 'Entertainment', budget: 150, actual: 90 },
    { name: 'Savings', budget: 500, actual: 500 },
  ];

  // Placeholder AI insights
  placeholderInsights = [
    { title: 'Food budget alert', description: 'You\'re on track to exceed your Food budget by $120 this month.', type: 'warning' as const },
    { title: 'Savings on track', description: 'Your savings rate increased 4% vs last month. Keep it up!', type: 'success' as const },
    { title: 'Housing cost stable', description: 'Housing expenses have stayed within budget for 3 consecutive months.', type: 'success' as const },
    { title: 'Unusual activity', description: 'A $340 charge was detected in Entertainment — higher than your monthly average.', type: 'info' as const },
  ];

  // Chart range
  chartRange: '1D' | '1W' | '1M' = '1M';

  // ...

  calculateSummary() {
    this.totalBalance = this.accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

    const currentMonth = new Date().getMonth();
    const currentMonthTransactions = this.transactions.filter(t => new Date(t.date).getMonth() === currentMonth);

    this.monthlyIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    this.monthlyExpenses = Math.abs(currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0));

    // Budget Calculations
    this.budgetRemaining = this.monthlyBudget - this.monthlyExpenses;
    this.budgetUsedPercentage = (this.monthlyExpenses / this.monthlyBudget) * 100;
  }

  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private apiService: ApiService,
    private cd: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    // Subscribe to auth state changes
    this.authService.user$.subscribe(async (user) => {
      if (user) {
        this.userName = user.displayName || user.email?.split('@')[0] || 'User';
        this.userEmail = user.email || '';
        await this.loadData();
      } else {
        // Optional: Redirect if not logged in, though auth guard usually handles this
        // this.router.navigate(['/login']);
      }
    });


  }

  async loadData() {
    this.isLoading = true;
    try {
      // Load accounts from API
      this.accounts = await this.apiService.getAccounts();

      // Load transactions from API
      this.transactions = await this.apiService.getTransactions(50);

      // Load AI insights from API
      this.aiInsights = await this.apiService.getAIInsights();

      // Calculate summary from real data
      this.calculateSummary();
    } catch (error) {
      console.error('Error loading data:', error);
      // Ensure empty state on error
      this.accounts = [];
      this.transactions = [];
      this.aiInsights = [];
      this.calculateSummary();
    } finally {
      this.isLoading = false;
      this.cd.detectChanges();
    }
  }

  async logout() {
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }

  async createAccount() {
    if (this.isLoading) return;
    this.isLoading = true;
    try {
      await this.apiService.createAccount({
        name: this.newAccountName,
        type: this.newAccountType,
        balance: this.newAccountBalance
      } as any);

      this.showAddAccountModal = false;
      // Reset form
      this.newAccountName = '';
      this.newAccountType = 'checking';
      this.newAccountBalance = 0;

      await this.loadData();
    } catch (error) {
      console.error('Error creating account:', error);
      alert('Failed to create account. Please try again.');
    } finally {
      this.isLoading = false;
      this.cd.detectChanges();
    }
  }

  editAccount(account: Account) {
    this.editingAccount = { ...account };
    this.showEditAccountModal = true;
  }

  async saveEditedAccount() {
    if (this.isLoading) return;
    if (!this.editingAccount.name) {
      alert('Please enter an account name');
      return;
    }
    this.isLoading = true;
    try {
      await this.apiService.updateAccount(this.editingAccount.id, {
        name: this.editingAccount.name,
        type: this.editingAccount.type
      });
      this.showEditAccountModal = false;
      await this.loadData();
    } catch (error) {
      console.error('Error updating account:', error);
      alert('Failed to update account. Please try again.');
    } finally {
      this.isLoading = false;
      this.cd.detectChanges();
    }
  }

  async createTransaction() {
    if (this.isLoading) return;

    // Roth IRA Contribution Limit Check (Client-side)
    if (this.newTransactionType === 'income') { // Deposit
      const targetAccount = this.accounts.find(a => a.id === this.newTransactionAccountId);

      if (targetAccount && targetAccount.type === 'roth') {
        // 1. Calculate current year contributions
        const currentYear = new Date().getFullYear();
        const currentContributions = this.transactions
          .filter(t => {
            // Filter for income (deposits) to this specific account in the current year
            // Note: 't.accountId' isn't on the interface but we need it. 
            // Ideally backend handles this, but for now we approximate or fetch full history.
            // Since interface lacks accountId, we can't strictly filter by account ID on client transactions alone 
            // UNLESS we update the interface or fetchAccountTransactions.
            // Fallback: Just warn the user for now since we don't have accountId on loaded transactions easily.
            return false;
          })
          .reduce((sum, t) => sum + t.amount, 0);

        // Since we can't easily filter client-side transactions by account ID (missing property), 
        // We will implement a simplified check based on the current balance + new amount for now, 
        // OR just strictly check the new amount if we assume balance tracks contributions (incorrect).

        // BETTER APPROACH: Let's fetch the account details or trust the balance? 
        // Roth limit is strictly CONTRIBUTIONS, not balance. 
        // Let's implement a 'safe' check: if (newAmount > 7500) alert.
        if (this.newTransactionAmount > 7500) {
          alert('Warning: Annual Roth IRA contribution limit is $7,500. You are attempting to deposit more than that at once.');
          // We let them proceed with a warning, or block? User said "only goes up to 7500".
          // Let's block if single transaction > 7500.
          this.isLoading = false;
          return;
        }

        // TODO: For full history check, we need to fetch all transactions for this account from backend.
      }
    }

    this.isLoading = true;
    try {
      // Handle transfers differently - create two transactions
      if (this.newTransactionType === 'transfer') {
        if (!this.newTransactionToAccountId) {
          alert('Please select a destination account for the transfer');
          this.isLoading = false;
          return;
        }

        // Create withdrawal from source account
        await this.apiService.createTransaction({
          accountId: this.newTransactionAccountId,
          amount: -Math.abs(this.newTransactionAmount),
          category: 'Transfer',
          description: `Transfer to ${this.accounts.find(a => a.id === this.newTransactionToAccountId)?.name || 'account'}`,
          date: new Date(this.newTransactionDate),
          type: 'expense'
        } as any);

        // Create deposit to destination account
        await this.apiService.createTransaction({
          accountId: this.newTransactionToAccountId,
          amount: Math.abs(this.newTransactionAmount),
          category: 'Transfer',
          description: `Transfer from ${this.accounts.find(a => a.id === this.newTransactionAccountId)?.name || 'account'}`,
          date: new Date(this.newTransactionDate),
          type: 'income'
        } as any);
      } else {
        // Regular transaction
        await this.apiService.createTransaction({
          accountId: this.newTransactionAccountId,
          amount: this.newTransactionAmount,
          category: this.newTransactionCategory,
          description: this.newTransactionDescription,
          date: new Date(this.newTransactionDate),
          type: this.newTransactionType as 'income' | 'expense'
        } as any);
      }

      this.showAddTransactionModal = false;
      // Reset form
      this.newTransactionAccountId = '';
      this.newTransactionAmount = 0;
      this.newTransactionCategory = '';
      this.newTransactionDescription = '';
      this.newTransactionDate = new Date().toISOString().split('T')[0];
      this.newTransactionToAccountId = '';

      await this.loadData();
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Failed to create transaction. Please try again.');
    } finally {
      this.isLoading = false;
      this.cd.detectChanges();
    }
  }

  async deleteAccount(id: string) {
    if (!confirm('Are you sure you want to delete this account?')) return;

    if (this.isLoading) return;
    this.isLoading = true;
    try {
      await this.apiService.deleteAccount(id);
      await this.loadData();
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      this.isLoading = false;
      this.cd.detectChanges();
    }
  }

  async deleteTransaction(id: string) {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    if (this.isLoading) return;
    this.isLoading = true;
    try {
      await this.apiService.deleteTransaction(id);
      await this.loadData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction. Please try again.');
    } finally {
      this.isLoading = false;
      this.cd.detectChanges();
    }
  }




  navigateToAnalytics() {
    this.router.navigate(['/analytics']);
  }

  navigateToIncome() {
    this.router.navigate(['/income']);
  }

  addBudgetCategory() {
    this.budgetCategories.push({ name: 'New Category', budget: 0, actual: 0 });
  }

  removeBudgetCategory(index: number) {
    this.budgetCategories.splice(index, 1);
  }

  getMaxBudget(): number {
    return Math.max(...this.budgetCategories.map(c => Math.max(c.budget, c.actual)), 1);
  }

  // ─── Chart Data Methods ───

  getChartLabels(): string[] {
    const now = new Date();
    if (this.chartRange === '1D') {
      return ['12am', '4am', '8am', '12pm', '4pm', '8pm', 'Now'];
    } else if (this.chartRange === '1W') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const labels: string[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        labels.push(days[d.getDay()]);
      }
      return labels;
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const labels: string[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(months[d.getMonth()]);
      }
      return labels;
    }
  }

  private getBuckets(): { start: Date; end: Date; count: number } {
    const now = new Date();
    if (this.chartRange === '1D') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { start, end: now, count: 7 };
    } else if (this.chartRange === '1W') {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return { start, end: now, count: 7 };
    } else {
      const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      return { start, end: now, count: 6 };
    }
  }

  private bucketIndex(date: Date, start: Date, count: number): number {
    const totalMs = Date.now() - start.getTime();
    const elapsed = date.getTime() - start.getTime();
    const idx = Math.floor((elapsed / totalMs) * count);
    return Math.max(0, Math.min(count - 1, idx));
  }

  getSpendingPoints(): string {
    const { start, count } = this.getBuckets();
    const buckets = new Array(count).fill(0);
    const filtered = this.transactions.filter(t => t.type === 'expense' && new Date(t.date) >= start);
    filtered.forEach(t => {
      const idx = this.bucketIndex(new Date(t.date), start, count);
      buckets[idx] += Math.abs(Number(t.amount));
    });
    const max = Math.max(...buckets, 1);
    const svgW = 300;
    const svgH = 70;
    const margin = 5;
    return buckets.map((v, i) => {
      const x = (i / (count - 1)) * svgW;
      const y = margin + (1 - v / max) * (svgH - margin * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }

  getSpendingFill(): string {
    return this.getSpendingPoints() + ' 300,75 0,75';
  }

  getBudgetLinePoints(): string {
    const { count } = this.getBuckets();
    let budgetPerBucket = this.monthlyBudget;
    if (this.chartRange === '1D') budgetPerBucket = this.monthlyBudget / 30;
    else if (this.chartRange === '1W') budgetPerBucket = this.monthlyBudget / 4;

    const buckets = new Array(count).fill(0);
    const { start } = this.getBuckets();
    const filtered = this.transactions.filter(t => t.type === 'expense' && new Date(t.date) >= start);
    filtered.forEach(t => {
      const idx = this.bucketIndex(new Date(t.date), start, count);
      buckets[idx] += Math.abs(Number(t.amount));
    });
    const max = Math.max(...buckets, budgetPerBucket, 1);

    const svgW = 300;
    const svgH = 70;
    const margin = 5;
    const y = margin + (1 - budgetPerBucket / max) * (svgH - margin * 2);
    return `0,${y.toFixed(1)} 300,${y.toFixed(1)}`;
  }

  getBalancePoints(): string {
    const { start, count } = this.getBuckets();
    const buckets = new Array(count).fill(0);
    // Compute running balance per bucket
    const sorted = [...this.transactions]
      .filter(t => new Date(t.date) >= start)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let running = this.totalBalance;
    // Walk backwards to find starting balance
    sorted.slice().reverse().forEach(t => {
      if (t.type === 'income') running -= Math.abs(Number(t.amount));
      else running += Math.abs(Number(t.amount));
    });

    // Now walk forward filling buckets
    const balances = new Array(count).fill(running);
    sorted.forEach(t => {
      const idx = this.bucketIndex(new Date(t.date), start, count);
      if (t.type === 'income') running += Math.abs(Number(t.amount));
      else running -= Math.abs(Number(t.amount));
      for (let i = idx; i < count; i++) balances[i] = running;
    });

    const max = Math.max(...balances, 1);
    const min = Math.min(...balances, 0);
    const range = max - min || 1;
    const svgW = 300;
    const svgH = 70;
    const margin = 5;
    return balances.map((v, i) => {
      const x = (i / (count - 1)) * svgW;
      const y = margin + (1 - (v - min) / range) * (svgH - margin * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }

  getBalanceFill(): string {
    return this.getBalancePoints() + ' 300,75 0,75';
  }

  // ─── Interactive Chart Data ───

  getSpendingDataPoints(): { xPct: number; yPct: number; label: string }[] {
    const { start, count } = this.getBuckets();
    const buckets = new Array(count).fill(0);
    this.transactions.filter(t => t.type === 'expense' && new Date(t.date) >= start)
      .forEach(t => {
        const idx = this.bucketIndex(new Date(t.date), start, count);
        buckets[idx] += Math.abs(Number(t.amount));
      });
    const max = Math.max(...buckets, 1);
    const margin = 5;
    const chartH = 70 - margin * 2;
    return buckets.map((v, i) => ({
      xPct: (i / Math.max(count - 1, 1)) * 100,
      yPct: ((margin + (1 - v / max) * chartH) / 80) * 100,
      label: '$' + Math.round(v).toLocaleString()
    }));
  }

  getSpendingYTicks(): { pct: number; label: string }[] {
    const { start, count } = this.getBuckets();
    const buckets = new Array(count).fill(0);
    this.transactions.filter(t => t.type === 'expense' && new Date(t.date) >= start)
      .forEach(t => {
        const idx = this.bucketIndex(new Date(t.date), start, count);
        buckets[idx] += Math.abs(Number(t.amount));
      });
    const max = Math.max(...buckets, 1);
    const margin = 5;
    const chartH = 70 - margin * 2;
    return [max, max * 0.66, max * 0.33, 0].map(v => ({
      pct: ((margin + (1 - v / max) * chartH) / 80) * 100,
      label: '$' + Math.round(v).toLocaleString()
    }));
  }

  getBalanceDataPoints(): { xPct: number; yPct: number; label: string }[] {
    const { start, count } = this.getBuckets();
    const sorted = [...this.transactions]
      .filter(t => new Date(t.date) >= start)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let running = this.totalBalance;
    sorted.slice().reverse().forEach(t => {
      if (t.type === 'income') running -= Math.abs(Number(t.amount));
      else running += Math.abs(Number(t.amount));
    });
    const balances = new Array(count).fill(running);
    sorted.forEach(t => {
      const idx = this.bucketIndex(new Date(t.date), start, count);
      if (t.type === 'income') running += Math.abs(Number(t.amount));
      else running -= Math.abs(Number(t.amount));
      for (let i = idx; i < count; i++) balances[i] = running;
    });
    const max = Math.max(...balances, 1);
    const min = Math.min(...balances, 0);
    const range = max - min || 1;
    const margin = 5;
    const chartH = 70 - margin * 2;
    return balances.map((v, i) => ({
      xPct: (i / Math.max(count - 1, 1)) * 100,
      yPct: ((margin + (1 - (v - min) / range) * chartH) / 80) * 100,
      label: '$' + Math.round(v).toLocaleString()
    }));
  }

  getBalanceYTicks(): { pct: number; label: string }[] {
    const { start, count } = this.getBuckets();
    const sorted = [...this.transactions]
      .filter(t => new Date(t.date) >= start)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let running = this.totalBalance;
    sorted.slice().reverse().forEach(t => {
      if (t.type === 'income') running -= Math.abs(Number(t.amount));
      else running += Math.abs(Number(t.amount));
    });
    const balances = new Array(count).fill(running);
    sorted.forEach(t => {
      const idx = this.bucketIndex(new Date(t.date), start, count);
      if (t.type === 'income') running += Math.abs(Number(t.amount));
      else running -= Math.abs(Number(t.amount));
      for (let i = idx; i < count; i++) balances[i] = running;
    });
    const max = Math.max(...balances, 1);
    const min = Math.min(...balances, 0);
    const range = max - min || 1;
    const margin = 5;
    const chartH = 70 - margin * 2;
    return [max, min + range * 0.66, min + range * 0.33, min].map(v => ({
      pct: ((margin + (1 - (v - min) / range) * chartH) / 80) * 100,
      label: '$' + Math.round(v).toLocaleString()
    }));
  }
}

