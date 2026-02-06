import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
    selector: 'app-add-account-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    template: `
    <div class="modal-overlay" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Add New Account</h2>
          <button class="close-btn" (click)="close()">
            <lucide-icon [img]="X" [size]="20"></lucide-icon>
          </button>
        </div>

        <form (ngSubmit)="onSubmit()" class="modal-form">
          <div class="form-group">
            <label for="accountName">Account Name</label>
            <input
              type="text"
              id="accountName"
              [(ngModel)]="accountName"
              name="accountName"
              placeholder="e.g., Checking Account"
              required
            />
          </div>

          <div class="form-group">
            <label for="accountType">Account Type</label>
            <select id="accountType" [(ngModel)]="accountType" name="accountType" required>
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
              <option value="credit">Credit Card</option>
            </select>
          </div>

          <div class="form-group">
            <label for="balance">Initial Balance</label>
            <input
              type="number"
              id="balance"
              [(ngModel)]="balance"
              name="balance"
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" (click)="close()">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="isLoading">
              {{ isLoading ? 'Creating...' : 'Create Account' }}
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
export class AddAccountModalComponent {
    readonly X = X;

    @Output() closeModal = new EventEmitter<void>();
    @Output() accountCreated = new EventEmitter<any>();

    accountName = '';
    accountType = 'checking';
    balance = 0;
    isLoading = false;

    close() {
        this.closeModal.emit();
    }

    onSubmit() {
        if (!this.accountName) return;

        this.isLoading = true;
        this.accountCreated.emit({
            accountName: this.accountName,
            accountType: this.accountType,
            balance: this.balance
        });
    }
}
