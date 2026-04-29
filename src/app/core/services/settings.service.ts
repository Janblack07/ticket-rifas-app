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
    maxTicketsPerNumberPerDay: 5,
    paperSize: '80mm',
    showLogo: true,
    showWatermark: true,
    prizes: [
      { name: 'PRIMERA SUERTE', multiplier: 68 },
      { name: 'SEGUNDA SUERTE', multiplier: 10 },
      { name: 'TERCERA SUERTE', multiplier: 4 },
      { name: 'CUARTA SUERTE', multiplier: 2 },
      { name: 'QUINTA SUERTE', multiplier: 2 },
      { name: 'SEXTA SUERTE', multiplier: 1 },
      { name: 'SÉPTIMA SUERTE', multiplier: 1 },
    ],
    updatedAt: new Date().toISOString(),
  };

  private readonly settingsSignal = signal<AppSettings>(
  this.normalizeSettings(
    this.storage.get<AppSettings>(this.settingsKey) ?? this.defaultSettings
  )
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
    maxTicketsPerNumberPerDay:
      Number(settings.maxTicketsPerNumberPerDay) > 0
        ? Math.floor(Number(settings.maxTicketsPerNumberPerDay))
        : 5,
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
  private normalizeSettings(settings: AppSettings): AppSettings {
  return {
    ...this.defaultSettings,
    ...settings,
    maxTicketsPerNumberPerDay:
      Number(settings.maxTicketsPerNumberPerDay) > 0
        ? Math.floor(Number(settings.maxTicketsPerNumberPerDay))
        : this.defaultSettings.maxTicketsPerNumberPerDay,
    prizes: settings.prizes?.length
      ? settings.prizes
      : this.defaultSettings.prizes,
  };
}
}
