// File: frontend/worklink/src/app/layouts/candidato-layout/candidato-layout.component.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarCandidatoComponent } from '../../navigation/navbar-candidato/navbar-candidato.component';
import { SidebarCandidatoComponent } from '../../navigation/sidebar-candidato/sidebar-candidato.component';
import { TopbarComponent } from '../../navigation/topbar/topbar.component';
@Component({
  selector: 'app-candidato-layout',
  standalone: true,
  imports: [
    RouterModule,
    NavbarCandidatoComponent,
    SidebarCandidatoComponent,
    TopbarComponent
  ],
  templateUrl: './candidato-layout.component.html',
  styleUrls: ['./candidato-layout.component.css']
})
export class CandidatoLayoutComponent {

}