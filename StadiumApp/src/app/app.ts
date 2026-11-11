import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // مفاهيم الملزمة صفحة 1:
  protected readonly title = signal('StadiumReservationApp');
  name: string = "Mohanad"; // Property for Data Binding

  clickFunction() {
    alert("Button is clicked - Event Binding Working!");
  }
}