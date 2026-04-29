import { Prize } from './prize.interface';

export type TicketPaperSize = '58mm' | '80mm';

export interface AppSettings {
  businessName: string;
  ticketValidityDays: number;
  paperSize: TicketPaperSize;
  showLogo: boolean;
  showWatermark: boolean;

  /**
   * Cantidad máxima de tickets permitidos con el mismo número,
   * en la misma fecha de juego y con el mismo tipo de dígitos.
   */
  maxTicketsPerNumberPerDay: number;

  prizes: Prize[];
  updatedAt: string;
}
