import { Injectable, inject } from '@angular/core';
import { Ticket, GenerateTicketPayload } from '../interfaces/ticket.interface';
import { TicketPrize } from '../interfaces/prize.interface';
import {
  TicketQrPayload,
  TicketVerificationResult,
  TicketWinningResult,
} from '../interfaces/ticket-verification.interface';
import { SettingsService } from './settings.service';
import { AuthLocalService } from './auth-local.service';
import { CryptoService } from './crypto.service';
import { StorageService } from './storage.service';
import { WinnerService } from './winner.service';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private readonly settingsService = inject(SettingsService);
  private readonly auth = inject(AuthLocalService);
  private readonly crypto = inject(CryptoService);
  private readonly storage = inject(StorageService);
  private readonly winnerService = inject(WinnerService);

  private readonly lastTicketKey = 'ticket_rifas_last_ticket';
  private readonly ticketsHistoryKey = 'ticket_rifas_tickets_history';

  generateTicket(payload: GenerateTicketPayload): Ticket {
    const settings = this.settingsService.getSettings();
    const admin = this.auth.admin();

    if (!admin) {
      throw new Error('No existe un administrador autenticado.');
    }

    const normalizedNumber = this.normalizeNumber(payload.number, payload.digits);

    const usedCount = this.countTicketsByNumber(
      payload.playDate,
      payload.digits,
      normalizedNumber
    );

    const maxTicketsPerNumber =
      Number(settings.maxTicketsPerNumberPerDay) > 0
        ? Number(settings.maxTicketsPerNumberPerDay)
        : 5;

    if (usedCount >= maxTicketsPerNumber) {
      throw new Error(
        `El número ${normalizedNumber} ya alcanzó el límite de ${maxTicketsPerNumber} ventas para la fecha ${payload.playDate}.`
      );
    }

    const generatedAt = new Date();
    const expiresAt = new Date(generatedAt);
    expiresAt.setDate(generatedAt.getDate() + settings.ticketValidityDays);

    const basePrizes = this.settingsService.getPrizesByDigits(payload.digits);

const prizes: TicketPrize[] = basePrizes.map((prize) => ({
  ...prize,
  amountToPay: this.roundMoney(
    Number(payload.amount) * Number(prize.multiplier)
  ),
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

  verifyTicketFromQrPayload(rawQrPayload: string): TicketVerificationResult {
    const admin = this.auth.admin();

    if (!admin) {
      return {
        status: 'invalid',
        title: 'Ticket inválido',
        message: 'No existe administrador local para verificar la firma.',
      };
    }

    let payload: TicketQrPayload;

    try {
      payload = JSON.parse(rawQrPayload) as TicketQrPayload;
    } catch {
      return {
        status: 'invalid',
        title: 'QR inválido',
        message: 'El contenido del QR no tiene un formato válido.',
      };
    }

    const requiredFields: Array<keyof TicketQrPayload> = [
      'ticketId',
      'businessName',
      'digits',
      'number',
      'amount',
      'playDate',
      'generatedAt',
      'expiresAt',
      'signature',
    ];

    const hasMissingField = requiredFields.some((field) => {
      const value = payload[field];
      return value === undefined || value === null || value === '';
    });

    if (hasMissingField) {
      return {
        status: 'invalid',
        title: 'Ticket incompleto',
        message: 'El QR no contiene todos los datos necesarios.',
      };
    }

    const payloadWithoutSignature = {
      ticketId: payload.ticketId,
      businessName: payload.businessName,
      digits: payload.digits,
      number: payload.number,
      amount: payload.amount,
      playDate: payload.playDate,
      generatedAt: payload.generatedAt,
      expiresAt: payload.expiresAt,
    };

    const validSignature = this.crypto.verifyPayloadSignature(
      payloadWithoutSignature,
      payload.signature,
      admin.secretKey
    );

    if (!validSignature) {
      return {
        status: 'invalid',
        title: 'Ticket alterado',
        message: 'La firma del ticket no coincide. El QR pudo ser modificado.',
        payload,
      };
    }

    const now = new Date();
    const expiresAt = new Date(payload.expiresAt);

    if (Number.isNaN(expiresAt.getTime())) {
      return {
        status: 'invalid',
        title: 'Fecha inválida',
        message: 'La fecha de vencimiento del ticket no es válida.',
        payload,
      };
    }

    if (now > expiresAt) {
      return {
        status: 'expired',
        title: 'Ticket vencido',
        message: 'El ticket ya superó su fecha de validez.',
        payload,
      };
    }

    const dailyWinner = this.winnerService.getWinnerByDate(
      payload.playDate,
      payload.digits
    );

    if (!dailyWinner) {
      return {
        status: 'no-winners',
        title: 'Ticket válido',
        message:
          'El ticket es auténtico, pero aún no hay ganadores registrados para esa fecha.',
        payload,
      };
    }

    const matchedPrize = dailyWinner.prizes.find(
      (prize) => prize.winnerNumber === payload.number
    );

    if (!matchedPrize) {
      return {
        status: 'not-winner',
        title: 'Ticket válido, no ganador',
        message: 'El número jugado no coincide con los ganadores registrados.',
        payload,
      };
    }

    const winningResult: TicketWinningResult = {
      prizeName: matchedPrize.name,
      winnerNumber: matchedPrize.winnerNumber,
      multiplier: matchedPrize.multiplier,
      amountToPay: this.roundMoney(
        Number(payload.amount) * Number(matchedPrize.multiplier)
      ),
    };

    return {
      status: 'winner',
      title: 'Ticket ganador',
      message: `Ganó en ${matchedPrize.name}.`,
      payload,
      winningResult,
    };
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
      if (numericValue < 0 || numericValue > 999) {
        return 'Para 3 dígitos, el número debe estar entre 000 y 999.';
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
    const settings = this.settingsService.getSettings();
    const normalizedNumber = this.normalizeNumber(number, digits);

    const usedCount = this.countTicketsByNumber(
      playDate,
      digits,
      normalizedNumber
    );

    const maxTicketsPerNumber =
      Number(settings.maxTicketsPerNumberPerDay) > 0
        ? Number(settings.maxTicketsPerNumberPerDay)
        : 5;

    if (usedCount >= maxTicketsPerNumber) {
      return `El número ${normalizedNumber} ya alcanzó el límite de ${maxTicketsPerNumber} ventas para este día.`;
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

  countTicketsByNumber(
    playDate: string,
    digits: 2 | 3,
    normalizedNumber: string
  ): number {
    return this.getTicketsHistory().filter(
      (ticket) =>
        ticket.playDate === playDate &&
        ticket.digits === digits &&
        ticket.number === normalizedNumber
    ).length;
  }

  isNumberAlreadyUsed(
    playDate: string,
    digits: 2 | 3,
    normalizedNumber: string
  ): boolean {
    return this.countTicketsByNumber(playDate, digits, normalizedNumber) > 0;
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
