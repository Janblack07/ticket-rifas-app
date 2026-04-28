import { Injectable, inject } from '@angular/core';
import { Ticket, GenerateTicketPayload } from '../interfaces/ticket.interface';
import { TicketPrize } from '../interfaces/prize.interface';
import { SettingsService } from './settings.service';
import { AuthLocalService } from './auth-local.service';
import { CryptoService } from './crypto.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private readonly settingsService = inject(SettingsService);
  private readonly auth = inject(AuthLocalService);
  private readonly crypto = inject(CryptoService);
  private readonly storage = inject(StorageService);

  private readonly lastTicketKey = 'ticket_rifas_last_ticket';
  private readonly ticketsHistoryKey = 'ticket_rifas_tickets_history';

  generateTicket(payload: GenerateTicketPayload): Ticket {
    const settings = this.settingsService.getSettings();
    const admin = this.auth.admin();

    if (!admin) {
      throw new Error('No existe un administrador autenticado.');
    }

    const normalizedNumber = this.normalizeNumber(payload.number, payload.digits);

    if (this.isNumberAlreadyUsed(payload.playDate, payload.digits, normalizedNumber)) {
      throw new Error(
        `El número ${normalizedNumber} ya fue vendido para la fecha ${payload.playDate}.`
      );
    }

    const generatedAt = new Date();
    const expiresAt = new Date(generatedAt);
    expiresAt.setDate(generatedAt.getDate() + settings.ticketValidityDays);

    const prizes: TicketPrize[] = settings.prizes.map((prize) => ({
      ...prize,
      amountToPay: this.roundMoney(Number(payload.amount) * Number(prize.multiplier)),
    }));

    const basePayload = {
      ticketId: this.crypto.generateId(),
      businessName: settings.businessName,
      digits: payload.digits,
      number: normalizedNumber,
      amount: Number(payload.amount),
      playDate: payload.playDate,
      generatedAt: generatedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    const signature = this.crypto.signPayload(basePayload, admin.secretKey);

    const qrPayload = JSON.stringify({
      ...basePayload,
      signature,
    });

    const ticket: Ticket = {
      id: basePayload.ticketId,
      businessName: settings.businessName,
      digits: payload.digits,
      number: normalizedNumber,
      amount: Number(payload.amount),
      playDate: payload.playDate,
      generatedAt: generatedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      prizes,
      qrPayload,
      signature,
    };

    this.saveLastTicket(ticket);
    this.saveTicketToHistory(ticket);

    return ticket;
  }

  validateNumber(number: string, digits: 2 | 3): string | null {
    const cleanNumber = number.trim();

    if (!cleanNumber) {
      return 'Ingresa el número jugado.';
    }

    if (!/^\d+$/.test(cleanNumber)) {
      return 'El número solo puede contener dígitos.';
    }

    const numericValue = Number(cleanNumber);

    if (digits === 2) {
      if (numericValue < 0 || numericValue > 99) {
        return 'Para 2 dígitos, el número debe estar entre 00 y 99.';
      }

      if (cleanNumber.length > 2) {
        return 'Para 2 dígitos, el número no puede tener más de 2 caracteres.';
      }
    }

    if (digits === 3) {
      if (numericValue < 0 || numericValue > 99) {
        return 'Para 3 dígitos, el número debe estar entre 000 y 099.';
      }

      if (cleanNumber.length > 3) {
        return 'Para 3 dígitos, el número no puede tener más de 3 caracteres.';
      }
    }

    return null;
  }

  validateTicketAvailability(
    playDate: string,
    digits: 2 | 3,
    number: string
  ): string | null {
    const normalizedNumber = this.normalizeNumber(number, digits);

    if (this.isNumberAlreadyUsed(playDate, digits, normalizedNumber)) {
      return `El número ${normalizedNumber} ya fue vendido para este día.`;
    }

    return null;
  }

  normalizeNumber(number: string, digits: 2 | 3): string {
    const numericValue = Number(number.trim());

    if (digits === 2) {
      return numericValue.toString().padStart(2, '0');
    }

    return numericValue.toString().padStart(3, '0');
  }

  saveLastTicket(ticket: Ticket): void {
    this.storage.set(this.lastTicketKey, ticket);
  }

  getLastTicket(): Ticket | null {
    return this.storage.get<Ticket>(this.lastTicketKey);
  }

  getTicketsHistory(): Ticket[] {
    return this.storage.get<Ticket[]>(this.ticketsHistoryKey) ?? [];
  }

  getTicketsByDate(playDate: string, digits?: 2 | 3): Ticket[] {
    return this.getTicketsHistory().filter((ticket) => {
      const sameDate = ticket.playDate === playDate;
      const sameDigits = digits ? ticket.digits === digits : true;

      return sameDate && sameDigits;
    });
  }

  isNumberAlreadyUsed(
    playDate: string,
    digits: 2 | 3,
    normalizedNumber: string
  ): boolean {
    return this.getTicketsHistory().some(
      (ticket) =>
        ticket.playDate === playDate &&
        ticket.digits === digits &&
        ticket.number === normalizedNumber
    );
  }

  private saveTicketToHistory(ticket: Ticket): void {
    const history = this.getTicketsHistory();

    const updatedHistory = [ticket, ...history];

    this.storage.set(this.ticketsHistoryKey, updatedHistory);
  }

  private roundMoney(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
