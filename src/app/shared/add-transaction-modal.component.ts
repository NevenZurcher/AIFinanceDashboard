import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
    selector: 'app-add-transaction-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    template: `
    <div class="modal-overlay" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Add Transaction</h2>
          <button class="close-btn" (click)="close()">
            <lucide-icon [img]="X" [size]="20"></lucide-icon>
          </button>
        </div>

        <form (ngSubmit)="onSubmit()" class="modal-form">
          <div class="form-group">
            <label for="account">Account</label>
            <select id="account" [(ngModel)]="accountId" name="account" required>
              <option value="">Select an account</option>
              <option *ngFor="let account of accounts" [value]="account.id">
                {{ account.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="type">Type</label>
            <select id="type" [(ngModel)]="transactionType" name="type" required>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div class="form-group">
            <label for="amount">Amount</label>
            <input
              type="number"
              id="amount"
              [(ngModel)]="amount"
              name="amount"
              placeholder="0.00"
              step="0.01"
              required
            />
          </div>

          <div class="form-group">
            <label for="category">Category</label>
            <input
              type="text"
              id="category"
              [(ngModel)]="category"
              name="category"
              placeholder="e.g., Food, Salary, Rent"
            />
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <input
              type="text"
              id="description"
              [(ngModel)]="description"
              name="description"
              placeholder="Optional description"
            />
          </div>

          <div class="form-group">
            <label for="date">Date</label>
            <input
              type="date"
              id="date"
              [(ngModel)]="transactionDate"
              name="date"
              required
            />
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" (click)="close()">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="isLoading">
              {{ isLoading ? 'Adding...' : 'Add Transaction' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
    styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease;
    }

    .modal-content {
      background: var(--surface-color);
      border-radius: var(--radius-lg);
      padding: var(--spacing-xl);
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-lg);
    }

    .modal-header h2 {
      margin: 0;
      font-size: var(--font-size-xl);
      color: var(--text-primary);
    }

    .close-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: var(--spacing-xs);
      border-radius: var(--radius-md);
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: var(--hover-color);
      color: var(--text-primary);
    }

    .modal-form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .form-group label {
      font-size: var(--font-size-sm);
      font-weight: 500;
      color: var(--text-secondary);
    }

    .form-group input,
    .form-group select {
      padding: var(--spacing-sm);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      background: var(--background-color);
      color: var(--text-primary);
      font-size: var(--font-size-base);
      transition: all 0.2s;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .modal-actions {
      display: flex;
      gap: var(--spacing-sm);
      margin-top: var(--spacing-md);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class AddTransactionModalComponent {
    readonly X = X;

    @Input() accounts: any[] = [];
    @Output() closeModal = new EventEmitter<void>();
    @Output() transactionCreated = new EventEmitter<any>();

    accountId = '';
    transactionType = 'expense';
    amount = 0;
    category = '';
    description = '';
    transactionDate = new Date().toISOString().split('T')[0];
    isLoading = false;

    close() {
        this.closeModal.emit();
    }

    onSubmit() {
        if (!this.accountId || !this.amount) return;

        this.isLoading = true;
        this.transactionCreated.emit({
            accountId: this.accountId,
            amount: this.amount,
            category: this.category,
            description: this.description,
            transactionDate: this.transactionDate,
            transactionType: this.transactionType
        });
    }
}
