import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { RouterModule, ActivatedRoute } from '@angular/router'; 
import { AuthService } from '../../services/auth';
import { NoApi } from '../../../environments/environments';

@Component({
  selector: 'app-candidato-buscar-empleos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], 
  templateUrl: './candidato-buscar-empleos.component.html',
  styleUrls: ['./candidato-buscar-empleos.component.css']
})
export class CandidatoBuscarEmpleosComponent implements OnInit {

  filtros = {
    titulo: '',
    rubro: '',
    experiencia: '',
    salario_min: null
  };

  ofertas: any[] = [];
  isLoading: boolean = true;
  tituloResultados: string = 'Mostrando todas las ofertas';

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute 
  ) {}

  ngOnInit(): void {
  
    this.route.queryParamMap.subscribe(params => {
      const tituloUrl = params.get('titulo');
      if (tituloUrl) {
        this.filtros.titulo = tituloUrl;
      }
      this.ejecutarBusqueda(); 
    });
  }

  ejecutarBusqueda(): void {
    this.isLoading = true;
    this.ofertas = [];
    
    if (this.filtros.titulo) {
      this.tituloResultados = `Resultados para: "${this.filtros.titulo}"`;
    } else {
      this.tituloResultados = 'Mostrando todas las ofertas';
    }

    this.authService.buscarOfertas(this.filtros).subscribe({
      next: (data) => {
        this.ofertas = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al buscar ofertas:', err);
        alert(`Error: ${err.error?.message || 'No se pudieron cargar las ofertas.'}`);
        this.isLoading = false;
      }
    });
  }
  getLogoUrl(empresa: any): string {
    if (empresa?.logo) {
      return `${NoApi.apiUrl}/uploads/fotoPerfil/${empresa.logo}`;
    }
    return 'assets/imagenes/logo_empresa_default.png'; 
  }

  formatearSalario(oferta: any): string {
    if (oferta.salario_minimo && oferta.salario_maximo) {
      return `$${oferta.salario_minimo} - $${oferta.salario_maximo} / ${oferta.tipo_salario}`;
    }
    return 'Salario a convenir';
  }
}