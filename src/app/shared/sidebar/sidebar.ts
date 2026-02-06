import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { LucideAngularModule, Home, BarChart3, DollarSign, LogOut, Menu, X, Receipt } from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  readonly Home = Home;
  readonly BarChart3 = BarChart3;
  readonly DollarSign = DollarSign;
  readonly LogOut = LogOut;
  readonly Menu = Menu;
  readonly X = X;
  readonly Receipt = Receipt;

  isCollapsed = false;
  isLoginPage = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    // Check current route and subscribe to route changes
    this.checkRoute(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkRoute(event.url);
    });
  }

  private checkRoute(url: string) {
    this.isLoginPage = url === '/login' || url === '/' || url.startsWith('/login');
  }

  async logout() {
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}
