import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-failure',
  templateUrl: './failure.component.html',
  styleUrls: ['./failure.component.scss']
})
export class FailureComponent {
  private router = inject(Router);

  reintentar() {
    this.router.navigate(['/chat-clinico']);
  }
}