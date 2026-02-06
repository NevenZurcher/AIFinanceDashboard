import { Injectable } from '@angular/core';

export interface Account {
    id: string;
    name: string;
    type: string;
    balance: number;
    currency?: string;
    createdAt?: Date;
}

export interface Transaction {
    id: string;
    amount: number;
    category?: string;
    description?: string;
    date: Date;
    type: 'income' | 'expense';
    accountName?: string;
    accountId?: string;
}

export interface AIInsight {
    id: string;
    title: string;
    description: string;
    type: 'success' | 'warning' | 'info';
    createdAt?: Date;
}

@Injectable({
    providedIn: 'root'
})
export class MockApiService {
    private accounts: Account[] = [];
    private transactions: Transaction[] = [];
    private insights: AIInsight[] = [
        {
            id: '1',
            title: 'Great savings this month!',
            description: 'You saved 15% more than last month',
            type: 'success'
        }
    ];

    // Accounts
    async getAccounts(): Promise<Account[]> {
        return Promise.resolve([...this.accounts]);
    }

    async createAccount(account: Partial<Account>): Promise<Account> {
        const newAccount: Account = {
            id: Math.random().toString(36).substr(2, 9),
            name: account.name || '',
            type: account.type || 'checking',
            balance: account.balance || 0,
            currency: 'USD',
            createdAt: new Date()
        };
        this.accounts.push(newAccount);
        return Promise.resolve(newAccount);
    }

    // Transactions
    async getTransactions(limit: number = 50, accountId?: string): Promise<Transaction[]> {
        let filtered = [...this.transactions];
        if (accountId) {
            filtered = filtered.filter(t => t.accountId === accountId);
        }
        return Promise.resolve(filtered.slice(0, limit));
    }

    async createTransaction(transaction: Partial<Transaction>): Promise<Transaction> {
        const newTransaction: Transaction = {
            id: Math.random().toString(36).substr(2, 9),
            amount: transaction.amount || 0,
            category: transaction.category,
            description: transaction.description,
            date: transaction.date || new Date(),
            type: transaction.type || 'expense',
            accountId: transaction.accountId
        };
        this.transactions.push(newTransaction);
        return Promise.resolve(newTransaction);
    }

    // AI Insights
    async getAIInsights(): Promise<AIInsight[]> {
        return Promise.resolve([...this.insights]);
    }
}
