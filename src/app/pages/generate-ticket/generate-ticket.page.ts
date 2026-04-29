import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonText,
  IonIcon,
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  ticketOutline,
  cashOutline,
  calendarOutline,
} from 'ionicons/icons';

import { TicketDigits } from '../../core/interfaces/ticket.interface';
import { TicketService } from '../../core/services/ticket.service';
import { SettingsService } from '../../core/services/settings.service';

@Component({
  selector: 'app-generate-ticket',
  templateUrl: './generate-ticket.page.html',
  styleUrls: ['./generate-ticket.page.scss'],
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
    IonText,
    IonIcon,
  ],
})
export class GenerateTicketPage {
  private readonly router = inject(Router);
  private readonly ticketService = inject(TicketService);

  readonly settingsService = inject(SettingsService);

  digits: TicketDigits = 2;
  number = '';
  amount: number | null = 1;
  playDate = this.getTodayDate();

  errorMessage = '';

  constructor() {
    addIcons({
      arrowBackOutline,
      ticketOutline,
      cashOutline,
      calendarOutline,
    });
  }

  get settings() {
    return this.settingsService.settings();
  }

  get normalizedPreviewNumber(): string {
    if (!this.number.trim() || !/^\d+$/.test(this.number.trim())) {
      return this.digits === 2 ? '00' : '000';
    }

    return this.ticketService.normalizeNumber(this.number, this.digits);
  }

  get calculatedPrizes() {
    const value = Number(this.amount) || 0;

    return this.settings.prizes.map((prize) => ({
      ...prize,
      amountToPay:
        Math.round((value * prize.multiplier + Number.EPSILON) * 100) / 100,
    }));
  }

  onDigitsChange(): void {
    this.number = '';
    this.errorMessage = '';
  }

  generate(): void {
    this.errorMessage = '';

    const numberError = this.ticketService.validateNumber(
      this.number,
      this.digits
    );

    if (numberError) {
      this.errorMessage = numberError;
      return;
    }

    if (!this.playDate) {
      this.errorMessage = 'Selecciona la fecha de juego.';
      return;
    }

    const availabilityError = this.ticketService.validateTicketAvailability(
      this.playDate,
      this.digits,
      this.number
    );

    if (availabilityError) {
      this.errorMessage = availabilityError;
      return;
    }

    if (this.amount === null || Number(this.amount) <= 0) {
      this.errorMessage = 'Ingresa un valor apostado mayor a 0.';
      return;
    }

    try {
      this.ticketService.generateTicket({
        digits: this.digits,
        number: this.number,
        amount: Number(this.amount),
        playDate: this.playDate,
      });

      this.router.navigateByUrl('/ticket-preview');
    } catch (error) {
      this.errorMessage =
        error instanceof Error
          ? error.message
          : 'No se pudo generar el ticket.';
    }
  }

  goHome(): void {
    this.router.navigateByUrl('/home');
  }

  private getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
  get availabilityText(): string {
  if (!this.number.trim() || !/^\d+$/.test(this.number.trim())) {
    return '';
  }

  const normalizedNumber = this.ticketService.normalizeNumber(
    this.number,
    this.digits
  );

  const usedCount = this.ticketService.countTicketsByNumber(
    this.playDate,
    this.digits,
    normalizedNumber
  );

  const limit = this.settings.maxTicketsPerNumberPerDay;
  const available = Math.max(limit - usedCount, 0);

  return `Vendido ${usedCount}/${limit}. Cupos disponibles: ${available}.`;
}
}
