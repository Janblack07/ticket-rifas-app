import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonText,
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  trophyOutline,
  saveOutline,
  refreshOutline,
} from 'ionicons/icons';

import { TicketDigits } from '../../core/interfaces/ticket.interface';
import { DailyWinner } from '../../core/interfaces/winner.interface';
import { WinnerService } from '../../core/services/winner.service';

@Component({
  selector: 'app-winners',
  templateUrl: './winners.page.html',
  styleUrls: ['./winners.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonButton,
    IonIcon,
    IonInput,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonText,
  ],
})
export class WinnersPage implements OnInit {
  private readonly router = inject(Router);
  private readonly winnerService = inject(WinnerService);

  date = this.getTodayDate();
  digits: TicketDigits = 2;

  winner!: DailyWinner;

  errorMessage = '';
  successMessage = '';

  constructor() {
    addIcons({
      arrowBackOutline,
      trophyOutline,
      saveOutline,
      refreshOutline,
    });
  }

  ngOnInit(): void {
    this.loadWinner();
  }

  loadWinner(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const existingWinner = this.winnerService.getWinnerByDate(
      this.date,
      this.digits
    );

    if (existingWinner) {
      this.winner = this.winnerService.syncPrizesWithSettings(
        structuredClone(existingWinner)
      );
      return;
    }

    this.winner = this.winnerService.createEmptyWinner(this.date, this.digits);
  }

  onDateChange(): void {
    this.loadWinner();
  }

  onDigitsChange(): void {
    this.loadWinner();
  }

  save(): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.winner.date = this.date;
    this.winner.digits = this.digits;

    const error = this.winnerService.validateWinner(this.winner);

    if (error) {
      this.errorMessage = error;
      return;
    }

    this.winnerService.saveWinner(this.winner);
    this.winner = structuredClone(
      this.winnerService.getWinnerByDate(this.date, this.digits)!
    );

    this.successMessage = 'Ganadores guardados correctamente.';
  }

  resetForm(): void {
    const confirmReset = confirm(
      'Esto limpiará los números ingresados en pantalla. ¿Deseas continuar?'
    );

    if (!confirmReset) {
      return;
    }

    this.winner = this.winnerService.createEmptyWinner(this.date, this.digits);
    this.errorMessage = '';
    this.successMessage = '';
  }

  normalizePrizeNumber(index: number): void {
    const prize = this.winner.prizes[index];

    const error = this.winnerService.validateNumber(
      prize.winnerNumber,
      this.digits,
      prize.name
    );

    if (error) {
      return;
    }

    prize.winnerNumber = this.winnerService.normalizeNumber(
      prize.winnerNumber,
      this.digits
    );
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
}
