// File: frontend/worklink/src/app/app.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router'; 
import { signal } from '@angular/core';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet // <-- Impórtalo aquí
  ],
  template: `<router-outlet></router-outlet>`, 
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('worklink');
}
