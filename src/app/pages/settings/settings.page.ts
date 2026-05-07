import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonText,
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppSettings } from '../../core/interfaces/app-settings.interface';
import { SettingsService } from '../../core/services/settings.service';
import { AuthLocalService } from '../../core/services/auth-local.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonButton,
    IonInput,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonToggle,
    IonText,
  ],
})
export class SettingsPage implements OnInit {
  private readonly settingsService = inject(SettingsService);
  private readonly router = inject(Router);
  readonly auth = inject(AuthLocalService);

  settings!: AppSettings;
  successMessage = '';
  errorMessage = '';

  ngOnInit(): void {
    this.settings = structuredClone(this.settingsService.getSettings());
  }

  save(): void {
  this.successMessage = '';
  this.errorMessage = '';

  if (!this.settings.businessName.trim()) {
    this.errorMessage = 'El nombre del negocio es obligatorio.';
    return;
  }

  if (this.settings.ticketValidityDays < 1) {
    this.errorMessage = 'La validez debe ser mínimo de 1 día.';
    return;
  }

  if (
    !this.settings.maxTicketsPerNumberPerDay ||
    Number(this.settings.maxTicketsPerNumberPerDay) < 1
  ) {
    this.errorMessage = 'La cantidad máxima por número debe ser mínimo 1.';
    return;
  }

  const invalidTwoDigitPrize = this.settings.twoDigitPrizes.some(
  (prize) => Number(prize.multiplier) <= 0
);

const invalidThreeDigitPrize = this.settings.threeDigitPrizes.some(
  (prize) => Number(prize.multiplier) <= 0
);

if (invalidTwoDigitPrize || invalidThreeDigitPrize) {
  this.errorMessage = 'Todos los premios deben tener un valor mayor a 0.';
  return;
}
if (
  this.settings.salesCutoffEnabled &&
  !/^([01]\d|2[0-3]):([0-5]\d)$/.test(this.settings.salesCutoffTime)
) {
  this.errorMessage = 'La hora límite debe tener formato válido, por ejemplo 19:45.';
  return;
}

  this.settingsService.saveSettings(this.settings);
  this.successMessage = 'Configuración guardada correctamente.';
}

  reset(): void {
    const confirmReset = confirm(
      '¿Deseas restaurar los premios y configuración por defecto?'
    );

    if (!confirmReset) {
      return;
    }

    this.settingsService.resetSettings();
    this.settings = structuredClone(this.settingsService.getSettings());
    this.successMessage = 'Configuración restaurada.';
    this.errorMessage = '';
  }

  goHome(): void {
    this.router.navigateByUrl('/home');
  }

  logout(): void {
    this.auth.logout();
  }
}
