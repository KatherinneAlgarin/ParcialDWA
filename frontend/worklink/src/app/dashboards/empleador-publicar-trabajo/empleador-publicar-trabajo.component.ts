import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { Router, RouterModule } from '@angular/router'; 
import { AuthService } from '../../services/auth';

interface OfertaForm {
  titulo: string;
  rubro: string;
  tipo_contrato: string;
  cantidad_plazas: number;
  salario_minimo: number | null;
  salario_maximo: number | null;
  tipo_salario: string;
  educacion: string;
  experiencia: string;
  descripcion: string;
  responsabilidades: string;
}

@Component({
  selector: 'app-empleador-publicar-trabajo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './empleador-publicar-trabajo.component.html',
  styleUrls: ['./empleador-publicar-trabajo.component.css']
})
export class EmpleadorPublicarTrabajoComponent {

  oferta: OfertaForm = {
    titulo: '',
    rubro: '',
    tipo_contrato: '',
    cantidad_plazas: 1,
    salario_minimo: null,
    salario_maximo: null,
    tipo_salario: '',
    educacion: '',
    experiencia: '',
    descripcion: '',
    responsabilidades: ''
  };

  rubros = [
    'Tecnología', 'Diseño', 'Marketing', 'Ventas', 'Administración',
    'Recursos Humanos', 'Finanzas y Contabilidad', 'Legal y Cumplimiento',
    'Salud y Medicina', 'Educación y Capacitación', 'Ingeniería',
    'Logística y Cadena de Suministro', 'Construcción e Infraestructura',
    'Hostelería y Turismo', 'Manufactura y Producción',
    'Medio Ambiente y Sostenibilidad', 'Investigación y Desarrollo',
    'Atención al Cliente', 'Otro'
  ];
  
  tiposContrato = ['Tiempo completo', 'Medio tiempo', 'Por proyecto', 'Temporal', 'Pasantía'];
  tiposSalario = ['Mensual', 'Quincenal'];
  nivelesEducacion = [
    'Educacion no necesaria', 'Educación Media Completa', 'Bachillerato General',
    'Bachillerato Técnico', 'Técnico', 'Estudio Universitario Completo',
    'Postgrado/Maestría/Doctorado'
  ];
  nivelesExperiencia = [
    'Sin experiencia', '0-12 meses', '1-5 años', '5-10 años', 'Más de 10 años'
  ];

  isSubmitting: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.oferta.titulo || !this.oferta.rubro || !this.oferta.tipo_contrato || 
        !this.oferta.descripcion || !this.oferta.tipo_salario) {
      return;
    }

    this.isSubmitting = true;
    const datosAEnviar: any = { ...this.oferta };
    Object.keys(datosAEnviar).forEach(key => {
      if (datosAEnviar[key] === null || datosAEnviar[key] === '') {
        delete datosAEnviar[key];
      }
    });

    this.authService.crearOferta(datosAEnviar).subscribe({
      next: (res) => {
        console.log('Oferta creada:', res);
        alert('¡Oferta de trabajo publicada exitosamente!');
        setTimeout(() => {
          this.router.navigate(['/empleador/mis-trabajos']);
        }, 1000);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error al publicar la oferta:', err);
        
        let mensaje = err.error?.message || 'Ocurrió un error al publicar la oferta.';
        if (err.error?.errors && Array.isArray(err.error.errors)) {
          mensaje = err.error.errors.map((e: any) => e.msg).join(', ');
        }
        
        alert(`Error: ${mensaje}`);
      }
    });
  }
}