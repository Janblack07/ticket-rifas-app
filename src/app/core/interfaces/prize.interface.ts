export type PrizeName =
  | 'PRIMERA SUERTE'
  | 'SEGUNDA SUERTE'
  | 'TERCERA SUERTE'
  | 'CUARTA SUERTE'
  | 'QUINTA SUERTE'
  | 'SEXTA SUERTE'
  | 'SÉPTIMA SUERTE';

export interface Prize {
  name: PrizeName;
  multiplier: number;
}

export interface TicketPrize extends Prize {
  amountToPay: number;
}
