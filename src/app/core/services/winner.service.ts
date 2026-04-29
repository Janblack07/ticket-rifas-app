import { Injectable, inject } from '@angular/core';
import { DailyWinner, DailyWinnerPrize } from '../interfaces/winner.interface';
import { TicketDigits } from '../interfaces/ticket.interface';
import { StorageService } from './storage.service';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root',
})
export class WinnerService {
  private readonly storage = inject(StorageService);
  private readonly settingsService = inject(SettingsService);

  private readonly winnersKey = 'ticket_rifas_daily_winners';

  createEmptyWinner(date: string, digits: TicketDigits): DailyWinner {
    const settings = this.settingsService.getSettings();

    return {
      date,
      digits,
      prizes: settings.prizes.map((prize) => ({
        name: prize.name,
        winnerNumber: '',
        multiplier: prize.multiplier,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  saveWinner(winner: DailyWinner): void {
    const winners = this.getAllWinners();

    const normalizedWinner: DailyWinner = {
      ...winner,
      prizes: winner.prizes.map((prize) => ({
        ...prize,
        winnerNumber: this.normalizeNumber(prize.winnerNumber, winner.digits),
        multiplier: Number(prize.multiplier) || 0,
      })),
      updatedAt: new Date().toISOString(),
    };

    const existingIndex = winners.findIndex(
      (item) => item.date === winner.date && item.digits === winner.digits
    );

    if (existingIndex >= 0) {
      winners[existingIndex] = {
        ...normalizedWinner,
        createdAt: winners[existingIndex].createdAt,
      };
    } else {
      winners.unshift(normalizedWinner);
    }

    this.storage.set(this.winnersKey, winners);
  }

  getWinnerByDate(date: string, digits: TicketDigits): DailyWinner | null {
    return (
      this.getAllWinners().find(
        (winner) => winner.date === date && winner.digits === digits
      ) ?? null
    );
  }

  getAllWinners(): DailyWinner[] {
    return this.storage.get<DailyWinner[]>(this.winnersKey) ?? [];
  }

  validateWinner(winner: DailyWinner): string | null {
    if (!winner.date) {
      return 'Selecciona la fecha del sorteo.';
    }

    if (!winner.digits) {
      return 'Selecciona el tipo de número.';
    }

    for (const prize of winner.prizes) {
      const numberError = this.validateNumber(
        prize.winnerNumber,
        winner.digits,
        prize.name
      );

      if (numberError) {
        return numberError;
      }

      if (Number(prize.multiplier) <= 0) {
        return `El premio de ${prize.name} debe ser mayor a 0.`;
      }
    }

    return null;
  }

  validateNumber(
    number: string,
    digits: TicketDigits,
    prizeName = 'PREMIO'
  ): string | null {
    const cleanNumber = number.trim();

    if (!cleanNumber) {
      return `Ingresa el número ganador de ${prizeName}.`;
    }

    if (!/^\d+$/.test(cleanNumber)) {
      return `El número de ${prizeName} solo puede contener dígitos.`;
    }

    const numericValue = Number(cleanNumber);

    if (digits === 2) {
      if (cleanNumber.length > 2) {
        return `El número de ${prizeName} no puede tener más de 2 dígitos.`;
      }

      if (numericValue < 0 || numericValue > 99) {
        return `El número de ${prizeName} debe estar entre 00 y 99.`;
      }
    }

    if (digits === 3) {
      if (cleanNumber.length > 3) {
        return `El número de ${prizeName} no puede tener más de 3 dígitos.`;
      }

      if (numericValue < 0 || numericValue > 999) {
        return `El número de ${prizeName} debe estar entre 000 y 999.`;
      }
    }

    return null;
  }

  normalizeNumber(number: string, digits: TicketDigits): string {
    const numericValue = Number(number.trim());

    if (digits === 2) {
      return numericValue.toString().padStart(2, '0');
    }

    return numericValue.toString().padStart(3, '0');
  }

  syncPrizesWithSettings(winner: DailyWinner): DailyWinner {
  const settings = this.settingsService.getSettings();

  const updatedPrizes: DailyWinnerPrize[] = settings.prizes.map((settingPrize) => {
    const currentPrize = winner.prizes.find((prize) => {
      return (
        prize.name === settingPrize.name ||
        this.normalizePrizeName(prize.name) === this.normalizePrizeName(settingPrize.name)
      );
    });

    return {
      name: settingPrize.name,
      winnerNumber: currentPrize?.winnerNumber ?? '',
      multiplier: settingPrize.multiplier,
    };
  });

  return {
    ...winner,
    prizes: updatedPrizes,
  };
}

private normalizePrizeName(name: string): string {
  return name
    .replace(' SUERTE', '')
    .replace('SÉPTIMA', 'SEPTIMA')
    .replace('SÉXTA', 'SEXTA')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();
}
}
