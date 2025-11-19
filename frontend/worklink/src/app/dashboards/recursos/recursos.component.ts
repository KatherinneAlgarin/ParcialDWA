import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../../services/auth';
import { Subject } from 'rxjs';
import {NoApi} from '../../../environments/environments';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-recursos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recursos.component.html',
  styleUrls: ['./recursos.component.css']
})
export class RecursosComponent implements OnInit {

  recursosEntrevistas: any[] = [];
  recursosCV: any[] = [];
  recursosHabilidades: any[] = [];
  
  isLoading: boolean = true;
  
  searchTerm: string = '';
  private searchSubject = new Subject<string>();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.cargarRecursos('');

    this.searchSubject.pipe(
      debounceTime(500), 
      distinctUntilChanged() 
    ).subscribe(busqueda => {
      this.cargarRecursos(busqueda);
    });
  }

  onSearchChange(term: string): void {
    this.searchSubject.next(term);
  }

  onSearchSubmit(): void {
    
    this.cargarRecursos(this.searchTerm);
  }

  cargarRecursos(busqueda: string): void {
    this.isLoading = true;
    
    this.recursosEntrevistas = [];
    this.recursosCV = [];
    this.recursosHabilidades = [];

    this.authService.getRecursos(busqueda).subscribe({
      next: (recursos) => {
        recursos.forEach((recurso: any) => {
          switch (recurso.tipoRecurso) {
            case 'Preparación para entrevistas':
              this.recursosEntrevistas.push(recurso);
              break;
            case 'CV y cartas de presentación':
              this.recursosCV.push(recurso);
              break;
            case 'Desarrollo de habilidades':
              this.recursosHabilidades.push(recurso);
              break;
          }
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar recursos:', err);
        this.isLoading = false;
      }
    });
  }

  getLogoUrl(empresa: any): string {
    if (empresa?.logo) {
      
      return `${NoApi.apiUrl}/uploads/fotoPerfil/${empresa.logo}`;
    }
    return 'assets/imagenes/imagen.png'; 
  }
}