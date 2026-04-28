import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonText,
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthLocalService } from '../../core/services/auth-local.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonButton,
    IonInput,
    IonItem,
    IonText,
  ],
})
export class LoginPage implements OnInit {
  private readonly auth = inject(AuthLocalService);
  private readonly router = inject(Router);

  username = '';
  password = '';

  errorMessage = '';

  ngOnInit(): void {
    if (!this.auth.hasAdmin()) {
      this.router.navigateByUrl('/register', { replaceUrl: true });
      return;
    }

    if (this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/home', { replaceUrl: true });
    }
  }

  login(): void {
    this.errorMessage = '';

    if (!this.username.trim()) {
      this.errorMessage = 'Ingresa tu usuario.';
      return;
    }

    if (!this.password.trim()) {
      this.errorMessage = 'Ingresa tu contraseña.';
      return;
    }

    const result = this.auth.login({
      username: this.username,
      password: this.password,
    });

    if (!result.ok) {
      this.errorMessage = result.message;
      return;
    }

    this.router.navigateByUrl('/home', { replaceUrl: true });
  }

  resetApp(): void {
    const confirmReset = confirm(
      'Esto eliminará el administrador y la sesión local. ¿Deseas continuar?'
    );

    if (!confirmReset) {
      return;
    }

    this.auth.resetAll();
  }
}
