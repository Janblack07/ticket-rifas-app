import { PrizeName } from './prize.interface';
import { TicketDigits } from './ticket.interface';

export interface TicketQrPayload {
  ticketId: string;
  businessName: string;
  digits: TicketDigits;
  number: string;
  amount: number;
  playDate: string;
  generatedAt: string;
  expiresAt: string;
  signature: string;
}

export interface TicketWinningResult {
  prizeName: PrizeName;
  winnerNumber: string;
  amountToPay: number;
  multiplier: number;
}

export type TicketVerificationStatus =
  | 'valid'
  | 'expired'
  | 'invalid'
  | 'no-winners'
  | 'winner'
  | 'not-winner';

export interface TicketVerificationResult {
  status: TicketVerificationStatus;
  title: string;
  message: string;
  payload?: TicketQrPayload;
  winningResult?: TicketWinningResult;
}
