import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para *ngIf
import { AuthService } from '../../services/auth';
import {NoApi} from '../../../environments/environments';
@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit {
  usuario: any = null;
  fotoPerfilUrl: string = '';
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUsuarioLogueado();
    this.actualizarFotoPerfil();
  }

  actualizarFotoPerfil(): void {
    if (this.usuario?.foto_perfil) {
    
      this.fotoPerfilUrl = `${NoApi.apiUrl}/uploads/fotoPerfil/${this.usuario.foto_perfil}?t=${Date.now()}`;
    } else {
      this.fotoPerfilUrl = 'assets/imagenes/default-user.png';
    }
  }

  getFotoPerfil(): string {
    return this.fotoPerfilUrl;
  }
}