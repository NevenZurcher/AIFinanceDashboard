import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

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
export class ApiService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);

    // Azure Function App URL
    private apiUrl = environment.apiUrl;

    private async getHeaders(): Promise<HttpHeaders> {
        const token = await this.authService.getIdToken();
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }

    // Accounts
    async getAccounts(): Promise<Account[]> {
        const headers = await this.getHeaders();
        const response: any = await firstValueFrom(
            this.http.get(`${this.apiUrl}/GetAccounts`, { headers })
        );
        return (response.data || []).map((acc: any) => ({
            ...acc,
            balance: Number(acc.balance)
        }));
    }

    async createAccount(account: Partial<Account>): Promise<Account> {
        const headers = await this.getHeaders();
        const response: any = await firstValueFrom(
            this.http.post(`${this.apiUrl}/CreateAccount`, account, { headers })
        );
        return {
            ...response.data,
            balance: Number(response.data.balance)
        };
    }

    // Transactions
    async getTransactions(limit: number = 50, accountId?: string): Promise<Transaction[]> {
        const headers = await this.getHeaders();
        let url = `${this.apiUrl}/GetTransactions?limit=${limit}`;
        if (accountId) {
            url += `&accountId=${accountId}`;
        }
        const response: any = await firstValueFrom(
            this.http.get(url, { headers })
        );
        return (response.data || []).map((t: any) => ({
            ...t,
            amount: Number(t.amount),
            date: new Date(t.date) // Ensure date is a Date object
        }));
    }

    async createTransaction(transaction: Partial<Transaction>): Promise<Transaction> {
        const headers = await this.getHeaders();
        const response: any = await firstValueFrom(
            this.http.post(`${this.apiUrl}/CreateTransaction`, transaction, { headers })
        );
        return {
            ...response.data,
            amount: Number(response.data.amount),
            date: new Date(response.data.date)
        };
    }

    // AI Insights
    async getAIInsights(): Promise<AIInsight[]> {
        const headers = await this.getHeaders();
        const response: any = await firstValueFrom(
            this.http.get(`${this.apiUrl}/GetAIInsights`, { headers })
        );
        return response.data || [];
    }
    async deleteAccount(id: string): Promise<void> {
        const headers = await this.getHeaders();
        const response: any = await firstValueFrom(
            this.http.delete(`${this.apiUrl}/DeleteAccount?id=${id}`, { headers })
        );
    }

    async deleteTransaction(id: string): Promise<void> {
        const headers = await this.getHeaders();
        const response: any = await firstValueFrom(
            this.http.delete(`${this.apiUrl}/DeleteTransaction?id=${id}`, { headers })
        );
    }
}
