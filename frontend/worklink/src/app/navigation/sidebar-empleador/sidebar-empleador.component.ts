import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-sidebar-empleador',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar-empleador.component.html',
  styleUrls: ['./sidebar-empleador.component.css']
})
export class SidebarEmpleadorComponent {

  constructor(private authService: AuthService) {}

  logout(): void {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      this.authService.logout();
    }
  }
}