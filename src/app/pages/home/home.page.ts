import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonButton,
  IonContent,
  IonIcon,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  ticketOutline,
  trophyOutline,
  qrCodeOutline,
  settingsOutline,
  logOutOutline,
  listCircleOutline
} from 'ionicons/icons';

import { AuthLocalService } from '../../core/services/auth-local.service';
import { SettingsService } from '../../core/services/settings.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonButton,
    IonIcon,

  ],
})
export class HomePage {
  private readonly router = inject(Router);

  readonly auth = inject(AuthLocalService);
  readonly settingsService = inject(SettingsService);

  readonly settings = this.settingsService.settings;

  constructor() {
    addIcons({
      ticketOutline,
      trophyOutline,
      qrCodeOutline,
      settingsOutline,
      logOutOutline,
      listCircleOutline
    });
  }

  goTo(path: string): void {
    this.router.navigateByUrl(path);
  }

  logout(): void {
    const confirmLogout = confirm('¿Deseas cerrar sesión?');

    if (!confirmLogout) {
      return;
    }

    this.auth.logout();
  }
}
