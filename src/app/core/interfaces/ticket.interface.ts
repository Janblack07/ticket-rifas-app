import { TicketPrize } from './prize.interface';

export type TicketDigits = 2 | 3;

export interface Ticket {
  id: string;
  businessName: string;
  digits: TicketDigits;
  number: string;
  amount: number;
  playDate: string;
  generatedAt: string;
  expiresAt: string;
  prizes: TicketPrize[];
  qrPayload: string;
  signature: string;
}

export interface GenerateTicketPayload {
  digits: TicketDigits;
  number: string;
  amount: number;
  playDate: string;
}
