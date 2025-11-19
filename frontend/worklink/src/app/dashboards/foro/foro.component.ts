import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { RouterModule } from '@angular/router'; 
import { AuthService } from '../../services/auth';
import { Subject, Subscription, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

declare var bootstrap: any;

@Component({
  selector: 'app-foro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './foro.component.html',
  styleUrls: ['./foro.component.css']
})
export class ForoComponent implements OnInit, OnDestroy {

  temas: any[] = [];
  usuarioLogueado: any = null;

  isLoading: boolean = true;
  isSubmitting: boolean = false;
  
  searchTerm: string = '';
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  
  private postModal: any; 
  modoEdicion = false;
  temaActualId: number | null = null;
  
  formForo = {
    titulo: '',
    descripcion: ''
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    
    this.usuarioLogueado = this.authService.getUsuarioLogueado();

    this.cargarTemas('');
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300), 
      distinctUntilChanged()
    ).subscribe(busqueda => {
      this.cargarTemas(busqueda);
    });

    const modalEl = document.getElementById('postModal');
    if (modalEl) {
      this.postModal = new bootstrap.Modal(modalEl);
    }
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  cargarTemas(busqueda: string): void {
    this.isLoading = true;
    this.authService.getForos(busqueda).subscribe({
      next: (data) => {
        this.temas = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar temas:', err);
        this.isLoading = false;
      }
    });
  }

  
  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  abrirModalParaCrear(): void {
    if (!this.usuarioLogueado) {
      if (confirm('Debes iniciar sesión para crear un tema. ¿Deseas ir al login?')) {
        this.authService.logout(); // authService.logout() ya redirige a /login
      }
      return;
    }
    
    this.modoEdicion = false;
    this.formForo = { titulo: '', descripcion: '' }; // Resetea el formulario
    this.postModal.show();
  }

  abrirModalParaEditar(tema: any): void {
    this.modoEdicion = true;
    this.temaActualId = tema.idforo;
    this.formForo.titulo = tema.titulo;
    this.formForo.descripcion = tema.descripcion || '';
    this.postModal.show();
  }

  enviarFormularioForo(): void {
    if (!this.formForo.titulo) {
      alert('El título es obligatorio.');
      return;

    }

    this.isSubmitting = true;
    let peticion: Observable<any>;


    if (this.modoEdicion && this.temaActualId) {
      
      peticion = this.authService.actualizarForo(this.temaActualId, this.formForo);
    } else {
      
      
      peticion = this.authService.crearForo(this.formForo);
    }

    peticion.subscribe({
      next: () => {
        this.isSubmitting = false;
        alert(`¡Tema ${this.modoEdicion ? 'actualizado' : 'publicado'} correctamente!`);
        this.postModal.hide();
        this.cargarTemas(this.searchTerm); // Recarga los temas
      },
      error: (err) => {
        this.isSubmitting = false;
        alert(`Error: ${err.error?.message || 'No se pudo completar la acción.'}`);
      }
    });
  }

  eliminarTema(idforo: number): void {
    if (!confirm('¿Estás seguro de eliminar este tema? Todas sus respuestas también se borrarán.')) return;

    this.authService.eliminarForo(idforo).subscribe({
      next: () => {
        alert('Tema eliminado correctamente.');
        this.cargarTemas(this.searchTerm); // Recarga los temas
      },
      error: (err) => {
        alert(`Error: ${err.error?.message || 'No se pudo eliminar el tema.'}`);
      }
    });
  }


  esAutor(tema: any): boolean {

    return this.usuarioLogueado && tema.Usuario && this.usuarioLogueado.id === tema.Usuario.id;
  }

  formatearFecha(fechaISO: string): string {

    return new Date(fechaISO).toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  }
}