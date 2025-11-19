import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../../services/auth';
import { CountriesService } from '../../services/countries'; 
import { forkJoin } from 'rxjs'; 
import {NoApi} from '../../../environments/environments';

interface PerfilCandidato {
  nombre: string;
  correo: string;
  direccion: string;
  experiencia: string;
  educacion: string;
  nacionalidad: string;
  fecha_nacimiento: string;
  estado_civil: string;
  biografia: string;
  redes_sociales: {
    facebook: string;
    twitter: string;
    instagram: string;
    youtube: string;
  };
  foto_perfil: string; 
}

@Component({
  selector: 'app-candidato-ajustes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './candidato-ajustes.component.html',
  styleUrls: ['./candidato-ajustes.component.css']
})
export class CandidatoAjustesComponent implements OnInit {

  perfil: Partial<PerfilCandidato> = { redes_sociales: {} as any }; // Objeto para [(ngModel)]
  usuarioId: number | null = null;
  
  filtroNacionalidad: string = '';
  todosLosPaises: any[] = [];
  paisesFiltrados: any[] = [];
  banderaSeleccionada: string = '';

  isLoading: boolean = true;
  isSaving: boolean = false;
  fotoPreview: string | ArrayBuffer | null = null; 
  archivoFoto: File | null = null; 

  constructor(
    private authService: AuthService,
    private countriesService: CountriesService
  ) {}

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales(): void {
    const usuarioLogueado = this.authService.getUsuarioLogueado();
    if (!usuarioLogueado) {
      this.isLoading = false;
      alert('Error: No se pudo identificar al usuario.');
      return;
    }
    this.usuarioId = usuarioLogueado.id;

    forkJoin({
      perfil: this.authService.getUserProfile(),
      paises: this.countriesService.getAllCountries()
    }).subscribe({
      next: ({ perfil, paises }) => {
        this.todosLosPaises = paises.map(p => ({
          ...p,
          nombreMostrado: p.translations?.spa?.common || p.name.common
        }));
        this.paisesFiltrados = this.todosLosPaises;

        this.mapearPerfil(perfil);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando datos:', err);
        this.isLoading = false;
        alert('No se pudieron cargar tus datos o la lista de países.');
      }
    });
  }

  mapearPerfil(data: any): void {
    let redes = { facebook: '', twitter: '', instagram: '', youtube: '' };
    if (data.redes_sociales) {
      try {
        redes = typeof data.redes_sociales === 'string' 
          ? JSON.parse(data.redes_sociales) 
          : data.redes_sociales;
      } catch (e) { console.error('Error parseando redes sociales'); }
    }

    this.perfil = {
      nombre: data.nombre || '',
      correo: data.correo || '',
      direccion: data.direccion || '',
      experiencia: data.experiencia || '',
      educacion: data.educacion || '',
      nacionalidad: data.nacionalidad || '',
      fecha_nacimiento: data.fecha_nacimiento ? data.fecha_nacimiento.split('T')[0] : '',
      estado_civil: data.estado_civil || '',
      biografia: data.biografia || '',
      redes_sociales: redes,
      foto_perfil: data.foto_perfil || null
    };

    if (this.perfil.foto_perfil) {
      this.fotoPreview = `${NoApi.apiUrl}/uploads/fotoPerfil/${this.perfil.foto_perfil}?t=${Date.now()}`;
    }
    this.actualizarBandera();
  }

  actualizarBandera(): void {
    const pais = this.todosLosPaises.find(p => p.cca2 === this.perfil.nacionalidad);
    this.banderaSeleccionada = pais?.flags?.svg || '';
  }

  filtrarPaises(): void {
    const filtro = this.filtroNacionalidad.toLowerCase();
    this.paisesFiltrados = this.todosLosPaises.filter(p => 
      p.nombreMostrado.toLowerCase().includes(filtro)
    );
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida.');
        input.value = '';
        return;
      }
      
      this.archivoFoto = file; 

      const reader = new FileReader();
      reader.onload = (e) => this.fotoPreview = e.target?.result || null;
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (!this.usuarioId) {
      alert('Error: Sesión no válida.');
      return;
    }

    this.isSaving = true;
    const formData = new FormData();
    formData.append('nombre', this.perfil.nombre || '');
    formData.append('correo', this.perfil.correo || '');
    formData.append('direccion', this.perfil.direccion || '');
    formData.append('experiencia', this.perfil.experiencia || '');
    formData.append('educacion', this.perfil.educacion || '');
    formData.append('nacionalidad', this.perfil.nacionalidad || '');
    formData.append('fecha_nacimiento', this.perfil.fecha_nacimiento || '');
    formData.append('estado_civil', this.perfil.estado_civil || '');
    formData.append('biografia', this.perfil.biografia || '');
    formData.append('redes_sociales', JSON.stringify(this.perfil.redes_sociales));
    if (this.archivoFoto) {
      formData.append('fotoPerfil', this.archivoFoto);
    }
    this.authService.actualizarPerfil(this.usuarioId, formData).subscribe({
      next: (usuarioActualizado) => {
        this.isSaving = false;
        alert(' Cambios guardados correctamente.')
        this.mapearPerfil(usuarioActualizado);
        this.authService.saveAuthData(this.authService.getToken()!, usuarioActualizado);
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Error guardando perfil:', err);
        alert(`Error: ${err.error?.message || 'No se pudieron guardar los cambios.'}`);
      }
    });
  }
}