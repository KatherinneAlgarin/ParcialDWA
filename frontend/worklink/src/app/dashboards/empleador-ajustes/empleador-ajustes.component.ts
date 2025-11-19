import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../../services/auth';
import {NoApi} from '../../../environments/environments';
interface DatosEmpresa {
  nombre: string;
  descripcion: string;
  direccion: string;
  redesSociales: {
    facebook: string;
    twitter: string;
    instagram: string;
    youtube: string;
  };
}

@Component({
  selector: 'app-empleador-ajustes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './empleador-ajustes.component.html',
  styleUrls: ['./empleador-ajustes.component.css']
})
export class EmpleadorAjustesComponent implements OnInit {

  empresa: any = null; 
  
  formEmpresa: DatosEmpresa = {
    nombre: '',
    descripcion: '',
    direccion: '',
    redesSociales: { facebook: '', twitter: '', instagram: '', youtube: '' }
  };
  
  isLoading: boolean = true;
  isSaving: boolean = false;
  
  archivoLogo: File | null = null;
  logoPreview: string | ArrayBuffer | null = null;
  imgTimestamp: number = Date.now(); 

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.cargarDatosEmpresa();
  }

  cargarDatosEmpresa(): void {
    this.isLoading = true;
    this.authService.getMiEmpresa().subscribe({
      next: (data) => {
        this.empresa = data;
        if (data) {
          this.formEmpresa.nombre = data.nombre || '';
          this.formEmpresa.descripcion = data.descripcion || '';
          this.formEmpresa.direccion = data.direccion || '';
          
          if (data.redesSociales) {
            try {
              const redes = typeof data.redesSociales === 'string' ? JSON.parse(data.redesSociales) : data.redesSociales;
              this.formEmpresa.redesSociales = { ...this.formEmpresa.redesSociales, ...redes };
            } catch (e) { console.error('Error parseando redes'); }
          }

          if (data.logo) {
            this.logoPreview = `${NoApi.apiUrl}/uploads/fotoPerfil/${data.logo}?t=${this.imgTimestamp}`;
          }
          localStorage.setItem('empresa', JSON.stringify(data));
        }
        this.isLoading = false;
      },
      error: (err) => {
        if (err.status === 404) {
          console.log('Usuario sin empresa registrada (Modo Crear).');
          localStorage.removeItem('empresa');
        } else {
          console.error('Error cargando empresa:', err);
          alert('Error al cargar los datos de la empresa.');
        }
        this.isLoading = false;
      }
    });
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida.');
        return;
      }
      this.archivoLogo = file;

      const reader = new FileReader();
      reader.onload = (e) => this.logoPreview = e.target?.result || null;
      reader.readAsDataURL(file);
    }
  }
  onSubmit(): void {
    if (!this.formEmpresa.nombre.trim()) {
      alert('El nombre de la empresa es obligatorio.');
      return;
    }

    this.isSaving = true;
    const formData = new FormData();

    formData.append('nombre', this.formEmpresa.nombre);
    formData.append('descripcion', this.formEmpresa.descripcion);
    formData.append('direccion', this.formEmpresa.direccion);
    
    const redes = this.formEmpresa.redesSociales;
    if (Object.values(redes).some(val => val)) {
      formData.append('redesSociales', JSON.stringify(redes));
    }

    if (this.archivoLogo) {
      formData.append('logo', this.archivoLogo);
    }

    let peticion;
    if (this.empresa && this.empresa.idempresa) {
      peticion = this.authService.actualizarEmpresa(this.empresa.idempresa, formData);
    } else {
      peticion = this.authService.crearEmpresa(formData);
    }

    peticion.subscribe({
      next: (resData) => {
        this.isSaving = false;
        const metodo = this.empresa ? 'actualizada' : 'creada';
        alert(` Empresa ${metodo} correctamente.`);
        if (resData.token) {
          this.authService.saveAuthData(resData.token, this.authService.getUsuarioLogueado()); 
        }
        
        this.cargarDatosEmpresa();
      },
      error: (err) => {
        this.isSaving = false;
        alert(`Error: ${err.error?.message || 'Ocurrió un error en la operación.'}`);
      }
    });
  }

  eliminarEmpresa(): void {
    if (!this.empresa || !this.empresa.idempresa) {
      alert('No hay empresa asociada para eliminar.');
      return;
    }

    if (!confirm(' ¿Estás seguro de eliminar la empresa? Esta acción es irreversible.')) return;

    this.authService.eliminarEmpresa(this.empresa.idempresa).subscribe({
      next: (resData) => {
        alert(' Empresa eliminada correctamente.');
        
        if (resData.token) {
           localStorage.setItem('token', resData.token);
           localStorage.removeItem('empresa');
        }
        this.empresa = null;
        this.formEmpresa = { nombre: '', descripcion: '', direccion: '', redesSociales: { facebook: '', twitter: '', instagram: '', youtube: '' } };
        this.logoPreview = null;
        this.archivoLogo = null;
      },
      error: (err) => {
        alert(`Error: ${err.error?.message || 'Error eliminando la empresa.'}`);
      }
    });
  }
}