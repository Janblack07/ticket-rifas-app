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
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonButton,
    IonItem,
    IonText
],
})
export class RegisterPage implements OnInit {
  private readonly auth = inject(AuthLocalService);
  private readonly router = inject(Router);

  businessName = '4 Ases';
  adminName = '';
  username = '';
  password = '';
  confirmPassword = '';

  errorMessage = '';

  ngOnInit(): void {
    if (this.auth.hasAdmin()) {
      this.router.navigateByUrl('/login', { replaceUrl: true });
    }
  }

  register(): void {
    this.errorMessage = '';

    if (!this.businessName.trim()) {
      this.errorMessage = 'Ingresa el nombre del negocio.';
      return;
    }

    if (!this.adminName.trim()) {
      this.errorMessage = 'Ingresa el nombre del administrador.';
      return;
    }

    if (!this.username.trim()) {
      this.errorMessage = 'Ingresa un usuario.';
      return;
    }

    if (this.username.trim().length < 4) {
      this.errorMessage = 'El usuario debe tener mínimo 4 caracteres.';
      return;
    }

    if (!this.password.trim()) {
      this.errorMessage = 'Ingresa una contraseña o PIN.';
      return;
    }

    if (this.password.length < 4) {
      this.errorMessage = 'La contraseña debe tener mínimo 4 caracteres.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    const result = this.auth.register({
      businessName: this.businessName,
      adminName: this.adminName,
      username: this.username,
      password: this.password,
    });

    if (!result.ok) {
      this.errorMessage = result.message;
      return;
    }

    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
