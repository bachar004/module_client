import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,Sidebar,Topbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('front');
  
}
