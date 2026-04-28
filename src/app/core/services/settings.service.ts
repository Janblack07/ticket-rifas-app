import { Injectable, computed, inject, signal } from '@angular/core';
import { AppSettings } from '../interfaces/app-settings.interface';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly storage = inject(StorageService);
  private readonly settingsKey = 'ticket_rifas_settings';

  private readonly defaultSettings: AppSettings = {
    businessName: '24 Ases',
    ticketValidityDays: 5,
    paperSize: '80mm',
    showLogo: true,
    showWatermark: true,
    prizes: [
      { name: 'PRIMERA', multiplier: 68 },
      { name: 'SEGUNDA', multiplier: 10 },
      { name: 'TERCERA', multiplier: 4 },
      { name: 'CUARTA', multiplier: 2 },
      { name: 'QUINTA', multiplier: 2 },
      { name: 'SEXTA', multiplier: 1 },
      { name: 'SÉPTIMA', multiplier: 1 },
    ],
    updatedAt: new Date().toISOString(),
  };

  private readonly settingsSignal = signal<AppSettings>(
    this.storage.get<AppSettings>(this.settingsKey) ?? this.defaultSettings
  );

  settings = computed(() => this.settingsSignal());

  getSettings(): AppSettings {
    return this.settingsSignal();
  }

  saveSettings(settings: AppSettings): void {
    const updatedSettings: AppSettings = {
      ...settings,
      businessName: settings.businessName.trim() || '24 Ases',
      ticketValidityDays: Number(settings.ticketValidityDays) || 5,
      paperSize: settings.paperSize,
      showLogo: settings.showLogo,
      showWatermark: settings.showWatermark,
      prizes: settings.prizes.map((prize) => ({
        ...prize,
        multiplier: Number(prize.multiplier) || 0,
      })),
      updatedAt: new Date().toISOString(),
    };

    this.storage.set(this.settingsKey, updatedSettings);
    this.settingsSignal.set(updatedSettings);
  }

  resetSettings(): void {
    const settings = {
      ...this.defaultSettings,
      updatedAt: new Date().toISOString(),
    };

    this.storage.set(this.settingsKey, settings);
    this.settingsSignal.set(settings);
  }
}
