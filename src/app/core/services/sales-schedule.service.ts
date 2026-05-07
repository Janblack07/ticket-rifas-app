import { Injectable, inject } from '@angular/core';
import { SettingsService } from './settings.service';

export interface SalesScheduleStatus {
  isOpen: boolean;
  cutoffTime: string;
  currentTime: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class SalesScheduleService {
  private readonly settingsService = inject(SettingsService);

  getStatus(now: Date = new Date()): SalesScheduleStatus {
    const settings = this.settingsService.getSettings();
    const currentTime = this.formatTime(now);
    const cutoffTime = settings.salesCutoffTime || '19:45';

    if (!settings.salesCutoffEnabled) {
      return {
        isOpen: true,
        cutoffTime,
        currentTime,
        message: 'Las ventas están abiertas.',
      };
    }

    const currentMinutes = this.timeToMinutes(currentTime);
    const cutoffMinutes = this.timeToMinutes(cutoffTime);

    const isOpen = currentMinutes < cutoffMinutes;

    return {
      isOpen,
      cutoffTime,
      currentTime,
      message: isOpen
        ? `Las ventas están abiertas hasta las ${cutoffTime}.`
        : `Las ventas de tickets están cerradas. La generación está permitida hasta las ${cutoffTime}.`,
    };
  }

  canGenerateTickets(now: Date = new Date()): boolean {
    return this.getStatus(now).isOpen;
  }

  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);

    return hours * 60 + minutes;
  }
}
