export type PrizeName =
  | 'PRIMERA'
  | 'SEGUNDA'
  | 'TERCERA'
  | 'CUARTA'
  | 'QUINTA'
  | 'SEXTA'
  | 'SÉPTIMA';

export interface Prize {
  name: PrizeName;
  multiplier: number;
}

export interface TicketPrize extends Prize {
  amountToPay: number;
}
