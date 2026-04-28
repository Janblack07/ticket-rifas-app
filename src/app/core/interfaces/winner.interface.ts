import { TicketDigits } from './ticket.interface';
import { PrizeName } from './prize.interface';

export interface DailyWinnerPrize {
  name: PrizeName;
  winnerNumber: string;
  multiplier: number;
}

export interface DailyWinner {
  date: string;
  digits: TicketDigits;
  prizes: DailyWinnerPrize[];
  createdAt: string;
  updatedAt: string;
}
