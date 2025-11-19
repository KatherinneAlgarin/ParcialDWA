import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/registro/registro';
import { RecoverPasswordComponent } from './components/recover-password/recover-password';
import { ResetPasswordComponent } from './components/reset-password/reset-password';
import { CandidatoLayoutComponent } from './layouts/candidato-layout/candidato-layout.component';
import { CandidatoGeneralComponent } from './dashboards/candidato-general/candidato-general.component';
import { authGuard } from './guards/auth-guard';
import { CandidatoSolicitudesComponent } from './dashboards/candidato-solicitudes/candidato-solicitudes.component';
import { OfertaDetalleComponent } from './dashboards/oferta-detalle/oferta-detalle.component';
import { CandidatoAjustesComponent } from './dashboards/candidato-ajustes/candidato-ajustes.component';
import { CandidatoBuscarEmpleosComponent } from './dashboards/candidato-buscar-empleos/candidato-buscar-empleos.component';
import { RecursosComponent } from './dashboards/recursos/recursos.component';
import { ForoRespuestasComponent } from './dashboards/foro-respuestas/foro-respuestas.component';
import { ForoComponent } from './dashboards/foro/foro.component';
import { EmpresasComponent } from './dashboards/empresas/empresas.component';
import { EmpresaDetalleComponent } from './dashboards/empresa-detalle/empresa-detalle.component';
import { EmpleadorLayoutComponent } from './layouts/empleador-layout/empleador-layout.component';
import { EmpleadorGeneralComponent } from './dashboards/empleador-general/empleador-general.component';
import { EmpleadorAjustesComponent } from './dashboards/empleador-ajustes/empleador-ajustes.component';
import { EmpleadorAgregarRecursoComponent } from './dashboards/empleador-agregar-recurso/empleador-agregar-recurso.component';
import { EmpleadorMisRecursosComponent } from './dashboards/empleador-mis-recursos/empleador-mis-recursos.component';
import { EmpleadorMisTrabajosComponent } from './dashboards/empleador-mis-trabajos/empleador-mis-trabajos.component';
import { EmpleadorPublicarTrabajoComponent } from './dashboards/empleador-publicar-trabajo/empleador-publicar-trabajo.component';
import { EmpleadorCandidatosComponent } from './dashboards/empleador-candidatos/empleador-candidatos.component';
import { EmpleadorBuscarCandidatosComponent } from './dashboards/empleador-buscar-candidatos/empleador-buscar-candidatos.component';
export const routes: Routes = [
    
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'registro', component: RegisterComponent },
    { path: 'recover-password', component: RecoverPasswordComponent },
    { path: 'nueva-contrasena', component: ResetPasswordComponent },
    { 
        path: 'candidato', 
        component: CandidatoLayoutComponent, 
        canActivate: [authGuard], 
        data: { rol: 'Candidato' }, 
        children: [
            { path: '', redirectTo: 'general', pathMatch: 'full' }, 
            
            { path: 'general', component: CandidatoGeneralComponent }, 
            { path: 'solicitudes', component: CandidatoSolicitudesComponent },
            { path: 'ajustes', component: CandidatoAjustesComponent },
            { path: 'oferta/:id', component: OfertaDetalleComponent },
            { path: 'empleos', component: CandidatoBuscarEmpleosComponent },
            { path: 'recursos', component: RecursosComponent },
            { path: 'foro', component: ForoComponent },
            { path: 'foro/:id', component: ForoRespuestasComponent },
            { path: 'empresas', component: EmpresasComponent },
            { path: 'empresas/:id', component: EmpresaDetalleComponent },
        
        ]
    },
    { 
        path: 'empleador', 
        component: EmpleadorLayoutComponent,
        canActivate: [authGuard], 
        data: { rol: 'Empleador' }, 
        children: [
            { path: '', redirectTo: 'general', pathMatch: 'full' },
            { path: 'general', component: EmpleadorGeneralComponent },
            { path: 'recursos', component: RecursosComponent },
            { path: 'foro', component: ForoComponent },
            { path: 'foro/:id', component: ForoRespuestasComponent },
            
            { path: 'candidatos', component: EmpleadorBuscarCandidatosComponent },
            { path: 'publicar', component: EmpleadorPublicarTrabajoComponent },
            { path: 'mis-trabajos', component: EmpleadorMisTrabajosComponent },
            { path: 'candidatos/:id', component: EmpleadorCandidatosComponent },
            { path: 'mis-recursos', component: EmpleadorMisRecursosComponent },
            { path: 'agregar-recurso', component: EmpleadorAgregarRecursoComponent },
            { path: 'ajustes', component: EmpleadorAjustesComponent },
        ]
    }
];

