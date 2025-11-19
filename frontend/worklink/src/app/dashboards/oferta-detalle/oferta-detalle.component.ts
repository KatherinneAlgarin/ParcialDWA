import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ActivatedRoute, RouterModule } from '@angular/router'; 
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../../services/auth';
import {NoApi} from '../../../environments/environments';

declare var bootstrap: any;

@Component({
  selector: 'app-oferta-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], 
  templateUrl: './oferta-detalle.component.html',
  styleUrls: ['./oferta-detalle.component.css']
})
export class OfertaDetalleComponent implements OnInit {

  oferta: any = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  
  selectedFile: File | null = null;
  cartaPresentacion: string = '';
  isSubmitting: boolean = false;
  aplicacionEnviada: boolean = false;

  private idOferta: string = '';

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute 
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.idOferta = id;
        this.cargarDetalleOferta();
      } else {
        this.errorMessage = 'Error: No se especificó una oferta de trabajo.';
        this.isLoading = false;
      }
    });
  }

  cargarDetalleOferta(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.authService.getOfertaDetalle(this.idOferta).subscribe({
      next: (data) => {
        this.oferta = data;
        this.isLoading = false;
      
      },
      error: (err) => {
        this.errorMessage = 'La oferta de trabajo no fue encontrada.';
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFile = file;
    } else {
      alert('Por favor, selecciona un archivo PDF.');
      event.target.value = null; 
      this.selectedFile = null;
    }
  }

  enviarAplicacion(): void {
    if (!this.selectedFile) {
      alert('Por favor, selecciona un archivo PDF para tu CV.');
      return;
    }
    this.isSubmitting = true;

    const formData = new FormData();
    formData.append('cv', this.selectedFile);
    formData.append('carta_presentacion', this.cartaPresentacion);
    this.authService.aplicarOferta(this.idOferta, formData).subscribe({
      next: () => {
        alert(' ¡Has aplicado exitosamente a esta oferta!');
        this.isSubmitting = false;
        this.aplicacionEnviada = true; // Deshabilita el botón "Aplicar"
        this.hideModal();
      },
      error: (err) => {
        const message = err.error?.message || 'Error al enviar la aplicación.';
        alert(`Error: ${message}`);
        this.isSubmitting = false;
      }
    });
  }

  private hideModal(): void {
    const modalEl = document.getElementById('modalAplicar');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) {
        modal.hide();
      }
    }
  }

  getLogoUrl(empresa: any): string {

    if (empresa?.logo) {
      
      return `${NoApi.apiUrl}/uploads/fotoPerfil/${empresa.logo}`;
    }
    return 'assets/imagenes/Logo.jpg'; 
  }
  formatearSalario(oferta: any): string {

    if (oferta.salario_minimo && oferta.salario_maximo) {
      return `$${oferta.salario_minimo} - $${oferta.salario_maximo} / ${oferta.tipo_salario}`;
    }
    return 'A convenir';
  }
}