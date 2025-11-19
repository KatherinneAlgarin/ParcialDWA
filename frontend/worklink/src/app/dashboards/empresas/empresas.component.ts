import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { RouterModule } from '@angular/router'; 
import { AuthService } from '../../services/auth';
import {NoApi} from '../../../environments/environments';
@Component({
  selector: 'app-empresas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './empresas.component.html',
  styleUrls: ['./empresas.component.css']
})
export class EmpresasComponent implements OnInit {

  empresas: any[] = [];
  isLoading: boolean = true;
  filtroNombre: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.cargarEmpresas();
  }

  cargarEmpresas(): void {
    this.isLoading = true;
    this.authService.getEmpresas(this.filtroNombre).subscribe({
      next: (data) => {
        this.empresas = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar empresas:', err);
        this.isLoading = false;
      }
    });
  }

  getLogoUrl(empresa: any): string {
    if (empresa?.logo) {
      return `${NoApi.apiUrl}/uploads/fotoPerfil/${empresa.logo}`;
    }
    return 'assets/imagenes/Logo.jpg';
  }

  getEstrellas(valoracion: string | number): string[] {
    const rating = parseFloat(String(valoracion)) || 0;
    const estrellas: string[] = [];

    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        estrellas.push('full');
      } else if (i === Math.floor(rating) + 1 && (rating % 1) >= 0.5) {
        estrellas.push('half');
      } else {
        estrellas.push('empty');
      }
    }
    return estrellas;
  }

  getValoracionNumerica(val: any): string {
    return parseFloat(val || 0).toFixed(1);
  }
}