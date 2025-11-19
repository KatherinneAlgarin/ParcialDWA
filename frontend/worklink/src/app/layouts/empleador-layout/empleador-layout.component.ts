import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarEmpleadorComponent } from '../../navigation/navbar-empleador/navbar-empleador.component';
import { SidebarEmpleadorComponent } from '../../navigation/sidebar-empleador/sidebar-empleador.component';
import { TopbarComponent } from '../../navigation/topbar/topbar.component'; 

@Component({
  selector: 'app-empleador-layout',
  standalone: true,
  imports: [
    RouterModule,
    NavbarEmpleadorComponent,
    SidebarEmpleadorComponent,
    TopbarComponent 
  ],
  templateUrl: './empleador-layout.component.html',
  styleUrls: ['./empleador-layout.component.css']
})
export class EmpleadorLayoutComponent { }