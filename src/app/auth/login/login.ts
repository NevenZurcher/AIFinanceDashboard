import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LucideAngularModule, TrendingUp, Zap, BarChart3, Sparkles, Shield } from 'lucide-angular';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  readonly TrendingUp = TrendingUp;
  readonly Zap = Zap;
  readonly BarChart3 = BarChart3;
  readonly Sparkles = Sparkles;
  readonly Shield = Shield;

  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  async onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter email and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.authService.signIn(this.email, this.password);
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      console.error('Login error:', error);
      this.errorMessage = error.message || 'Failed to sign in';
      this.isLoading = false;
    }
  }

  async onGoogleSignIn() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.authService.signInWithGoogle();
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      this.errorMessage = error.message || 'Failed to sign in with Google';
      this.isLoading = false;
    }
  }
}
