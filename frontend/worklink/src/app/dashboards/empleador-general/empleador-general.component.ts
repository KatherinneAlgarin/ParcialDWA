import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router'; 
import { AuthService } from '../../services/auth';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-empleador-general',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './empleador-general.component.html',
  styleUrls: ['./empleador-general.component.css']
})
export class EmpleadorGeneralComponent implements OnInit {

  usuario: any = null;
  empresa: any = null;
  ofertas: any[] = [];
  
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUsuarioLogueado();
    this.cargarDashboard();
  }

  cargarDashboard(): void {
    this.isLoading = true;
    this.errorMessage = null;
    forkJoin({
      
      empresa: this.authService.getMiEmpresa().pipe(catchError(() => of(null))),
      ofertas: this.authService.getMisOfertas().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ empresa, ofertas }) => {
        this.empresa = empresa;
        this.ofertas = ofertas;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar el dashboard:', err);
        this.errorMessage = 'Error al cargar los datos.';
        this.isLoading = false;
      }
    });
  }
}