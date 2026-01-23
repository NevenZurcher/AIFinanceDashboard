import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, TrendingUp, Zap, BarChart3, Sparkles, Shield } from 'lucide-angular';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  // Lucide Icons
  readonly TrendingUp = TrendingUp;
  readonly Zap = Zap;
  readonly BarChart3 = BarChart3;
  readonly Sparkles = Sparkles;
  readonly Shield = Shield;

  email = '';
  password = '';
  isLoading = false;

  constructor(private router: Router) { }

  onLogin() {
    this.isLoading = true;

    // Mock login - will be replaced with Azure AD B2C
    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate(['/dashboard']);
    }, 1000);
  }
}
