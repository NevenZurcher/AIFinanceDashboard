import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LucideAngularModule, Home, BarChart3, DollarSign, LogOut, Menu, X } from 'lucide-angular';

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

  isCollapsed = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  async logout() {
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}
