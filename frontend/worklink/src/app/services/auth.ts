// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authApiUrl = `${environment.apiUrl}/auth`;
  private usersApiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient, private router: Router) { }
  register(userData: any): Observable<any> {
    return this.http.post(`${this.usersApiUrl}`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.usersApiUrl}/login`, credentials);
  }
  forgotPassword(correo: string): Observable<any> {
    return this.http.post(`${this.authApiUrl}/forgot-password`, { correo });
  }
  verifyOtp(correo: string, otp: string): Observable<any> {
    return this.http.post(`${this.authApiUrl}/verify-otp`, { correo, otp });
  }
  getUserProfile(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return new Observable(subscriber => subscriber.error('No token'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.usersApiUrl}/perfil`, { headers });
  }
  buscarOfertas(filtros: any): Observable<any> {
    let params = new HttpParams();
    let tieneFiltros = false;

    for (const key in filtros) {
      if (filtros[key]) {
        params = params.append(key, filtros[key]);
        tieneFiltros = true;
      }
    }

    let url = '';
    if (tieneFiltros) {
      url = `${environment.apiUrl}/ofertas/buscar`;
    } else {
      url = `${environment.apiUrl}/ofertas`;
    }
    return this.http.get(url, { params });
  }
  getRecursos(busqueda: string = ''): Observable<any> {
    let params = new HttpParams();
    if (busqueda) {
      params = params.append('busqueda', busqueda);
    }
    return this.http.get(`${environment.apiUrl}/recursos`, { params });
  }
  getToken(): string | null {
    return localStorage.getItem('token');
  }
  resetPassword(correo: string, otp: string, nuevaPassword: string): Observable<any> {
    return this.http.post(`${this.authApiUrl}/reset-password`, { 
      correo, 
      otp, 
      nuevaPassword 
    });
  }
  
  getMisAplicaciones(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get(`${environment.apiUrl}/aplicaciones/mis-aplicaciones`, { headers });
  }
  saveAuthData(token: string, usuario: any): void {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('empresa');
    this.router.navigate(['/login']);
  }
  clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }
  getUsuarioLogueado(): any | null {
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      return JSON.parse(usuarioString);
    }
    return null;
  }
  eliminarAplicacion(idaplicacion: number | string): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.delete(`${environment.apiUrl}/aplicaciones/${idaplicacion}`, { headers });
  }
  getOfertaDetalle(idOferta: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/ofertas/${idOferta}`);
  }
  aplicarOferta(idOferta: string, formData: FormData): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.post(`${environment.apiUrl}/ofertas/${idOferta}/aplicar`, formData, { headers });
  }
  actualizarPerfil(idUsuario: string | number, formData: FormData): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.put(`${this.usersApiUrl}/${idUsuario}`, formData, { headers });
  }
  getForos(busqueda: string = ''): Observable<any> {
    let params = new HttpParams();
    if (busqueda) {
      params = params.append('busqueda', busqueda);
    }
    return this.http.get(`${environment.apiUrl}/foros`, { params });
  }
  crearForo(datos: { titulo: string, descripcion: string }): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${environment.apiUrl}/foros`, datos, { headers });
  }
  actualizarForo(idforo: string | number, datos: { titulo: string, descripcion: string }): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${environment.apiUrl}/foros/${idforo}`, datos, { headers });
  }
  eliminarForo(idforo: string | number): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${environment.apiUrl}/foros/${idforo}`, { headers });
  }
  getForoDetalle(idforo: string | number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/foros/${idforo}`);
  }
  crearRespuesta(idforo: string | number, contenido: string, parentId: string | number | null = null): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const body = {
      idforo: idforo,
      contenido: contenido,
      parent_id: parentId
    };
    return this.http.post(`${environment.apiUrl}/respuestas-foro`, body, { headers });
  }
  getEmpresas(nombre: string = ''): Observable<any> {
    let params = new HttpParams();
    if (nombre) {
      params = params.append('nombre', nombre);
    }
    return this.http.get(`${environment.apiUrl}/empresas`, { params });
  }
  getEmpresaDetalle(idEmpresa: string | number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/empresas/${idEmpresa}`);
  }
  getResenasEmpresa(idEmpresa: string | number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/resenas/empresa/${idEmpresa}`);
  }
  crearResena(idEmpresa: string | number, datos: { calificacion: number, comentario: string }): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${environment.apiUrl}/resenas/empresa/${idEmpresa}`, datos, { headers });
  }
  actualizarResena(idResena: string | number, datos: { calificacion: number, comentario: string }): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${environment.apiUrl}/resenas/${idResena}`, datos, { headers });
  }
  eliminarResena(idResena: string | number): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${environment.apiUrl}/resenas/${idResena}`, { headers });
  }
  getMiEmpresa(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${environment.apiUrl}/empresa/usuario/mi-empresa`, { headers });
  }
  crearEmpresa(formData: FormData): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${environment.apiUrl}/empresa`, formData, { headers });
  }
  getMisOfertas(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${environment.apiUrl}/ofertas/mi-empresa/ofertas`, { headers });
  }
  actualizarEmpresa(idEmpresa: string | number, formData: FormData): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${environment.apiUrl}/empresa/${idEmpresa}`, formData, { headers });
  }
  eliminarEmpresa(idEmpresa: string | number): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${environment.apiUrl}/empresa/${idEmpresa}`, { headers });
  }
  crearRecurso(datos: { titulo: string, descripcion: string, tipoRecurso: string, link: string }): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${environment.apiUrl}/recursos`, datos, { headers });
  }
  getMisRecursos(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${environment.apiUrl}/recursos/mis-recursos`, { headers });
  }
  eliminarRecurso(idRecurso: string | number): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${environment.apiUrl}/recursos/${idRecurso}`, { headers });
  }
  eliminarOferta(idOferta: string | number): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${environment.apiUrl}/ofertas/${idOferta}`, { headers });
  }
  getCandidatosDeOferta(idOferta: string | number): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${environment.apiUrl}/ofertas/${idOferta}/aplicaciones`, { headers });
  }
  actualizarEstadoAplicacion(idAplicacion: string | number, estado: string): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${environment.apiUrl}/aplicaciones/${idAplicacion}/estado`, { estado }, { headers });
  }
  crearOferta(ofertaData: any): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${environment.apiUrl}/ofertas`, ofertaData, { headers });
  }
  getTodasAplicacionesEmpresa(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${environment.apiUrl}/aplicaciones/empresa/todas`, { headers });
  }
}