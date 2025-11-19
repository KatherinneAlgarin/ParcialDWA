// File: frontend/worklink/src/app/navigation/sidebar-candidato/sidebar-candidato.component.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth'; 

@Component({
  selector: 'app-sidebar-candidato',
  standalone: true,
  imports: [
    RouterModule 
  ],
  templateUrl: './sidebar-candidato.component.html',
  styleUrls: ['./sidebar-candidato.component.css']
})
export class SidebarCandidatoComponent {

  constructor(private authService: AuthService) {}

  logout(): void {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      this.authService.logout();
    }
  }
}