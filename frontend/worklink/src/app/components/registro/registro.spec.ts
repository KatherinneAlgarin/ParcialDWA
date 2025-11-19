// File: frontend/worklink/src/app/components/registro/registro.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

// Componentes Reales
import { RegisterComponent } from './registro';
import { LoginComponent } from '../login/login'; // Importar el componente de login

// Dependencias
import { AuthService } from '../../services/auth';
import { routes } from '../../app.routes'; // Importar tus rutas reales

fdescribe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let location: Location;
  let router: Router;

  // Mock simple del AuthService
  const authServiceMock = {
    register: () => {}, // Mockear los métodos que usa el componente
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // 1. Importar los componentes STANDALONE que vamos a probar
      imports: [
        RegisterComponent, 
        LoginComponent, // Necesario para que la ruta '/login' funcione
        RouterTestingModule.withRoutes(routes) // Usar tus rutas reales
      ],
      // 2. Proveer mocks de los servicios
      providers: [
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    
    // Navegar a la ruta inicial para la prueba
    await router.navigate(['/registro']);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- PRUEBA DE INTEGRACIÓN DE NAVEGACIÓN ---
  
  it('Deberia de ir a /login cuando el boton "Iniciar sesión" es presionado', fakeAsync(() => {
    // 1. Verificar que estamos en /register
    expect(location.path()).toBe('/registro');

    // 2. Encontrar el enlace por su routerLink y hacerle clic
    // Usamos 'a[routerLink="/login"]' para ser específicos
    const nativeElement = fixture.nativeElement;
    const loginLink = nativeElement.querySelector('a[routerLink="/login"]');
    
    expect(loginLink).withContext('No se encontró el enlace a /login').toBeTruthy();
    loginLink.click();

    tick();

    // 4. Verificar que la ubicación del navegador ahora es /login
    expect(location.path()).toBe('/login');
  }));

});