import { Injectable, computed, inject, signal } from '@angular/core';
import { AppSettings } from '../interfaces/app-settings.interface';
import { Prize } from '../interfaces/prize.interface';
import { TicketDigits } from '../interfaces/ticket.interface';
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
    maxTicketsPerNumberPerDay: 5,

    twoDigitPrizes: [
      { name: 'PRIMERA SUERTE', multiplier: 68 },
      { name: 'SEGUNDA SUERTE', multiplier: 10 },
      { name: 'TERCERA SUERTE', multiplier: 4 },
      { name: 'CUARTA SUERTE', multiplier: 2 },
      { name: 'QUINTA SUERTE', multiplier: 2 },
      { name: 'SEXTA SUERTE', multiplier: 1 },
      { name: 'SÉPTIMA SUERTE', multiplier: 1 },
    ],

    threeDigitPrizes: [
      { name: 'PRIMERA SUERTE', multiplier: 600 },
      { name: 'SEGUNDA SUERTE', multiplier: 70 },
      { name: 'TERCERA SUERTE', multiplier: 30 },
      { name: 'CUARTA SUERTE', multiplier: 20 },
      { name: 'QUINTA SUERTE', multiplier: 15 },
      { name: 'SEXTA SUERTE', multiplier: 15 },
      { name: 'SÉPTIMA SUERTE', multiplier: 10 },
      { name: 'OCTAVA SUERTE', multiplier: 10 },
      { name: 'NOVENA SUERTE', multiplier: 5 },
    ],

    lotteryNote: 'Este ticket juega con los números ganadores de la lotería.',
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

  getPrizesByDigits(digits: TicketDigits): Prize[] {
    const settings = this.getSettings();

    return digits === 2
      ? settings.twoDigitPrizes
      : settings.threeDigitPrizes;
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

      twoDigitPrizes: settings.twoDigitPrizes.map((prize) => ({
        ...prize,
        multiplier: Number(prize.multiplier) || 0,
      })),

      threeDigitPrizes: settings.threeDigitPrizes.map((prize) => ({
        ...prize,
        multiplier: Number(prize.multiplier) || 0,
      })),

      lotteryNote:
        settings.lotteryNote?.trim() ||
        'Este ticket juega con los números ganadores de la lotería.',

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

  private normalizeSettings(settings: Partial<AppSettings> & any): AppSettings {
    return {
      ...this.defaultSettings,
      ...settings,

      maxTicketsPerNumberPerDay:
        Number(settings.maxTicketsPerNumberPerDay) > 0
          ? Math.floor(Number(settings.maxTicketsPerNumberPerDay))
          : this.defaultSettings.maxTicketsPerNumberPerDay,

      twoDigitPrizes:
        settings.twoDigitPrizes?.length
          ? settings.twoDigitPrizes
          : settings.prizes?.length
            ? settings.prizes
            : this.defaultSettings.twoDigitPrizes,

      threeDigitPrizes:
        settings.threeDigitPrizes?.length
          ? settings.threeDigitPrizes
          : this.defaultSettings.threeDigitPrizes,

      lotteryNote:
        settings.lotteryNote?.trim() ||
        this.defaultSettings.lotteryNote,
    };
  }
}
