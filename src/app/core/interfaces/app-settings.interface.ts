import { Prize } from './prize.interface';

export type TicketPaperSize = '58mm' | '80mm';

export interface AppSettings {
  businessName: string;
  ticketValidityDays: number;
  paperSize: TicketPaperSize;
  showLogo: boolean;
  showWatermark: boolean;
  prizes: Prize[];
  updatedAt: string;
}
