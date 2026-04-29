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
  listCircleOutline,
  calendarOutline,
  trophyOutline,
  searchOutline,
} from 'ionicons/icons';

import { TicketDigits } from '../../core/interfaces/ticket.interface';
import { DailyWinner } from '../../core/interfaces/winner.interface';
import { WinnerService } from '../../core/services/winner.service';

@Component({
  selector: 'app-daily-winners',
  templateUrl: './daily-winners.page.html',
  styleUrls: ['./daily-winners.page.scss'],
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

  ],
})
export class DailyWinnersPage implements OnInit {
  private readonly router = inject(Router);
  private readonly winnerService = inject(WinnerService);

  date = this.getTodayDate();
  digits: TicketDigits = 2;

  winner: DailyWinner | null = null;
  searched = false;

  constructor() {
    addIcons({
      arrowBackOutline,
      listCircleOutline,
      calendarOutline,
      trophyOutline,
      searchOutline,
    });
  }

  ngOnInit(): void {
    this.searchWinners();
  }

  searchWinners(): void {
  this.searched = true;

  const winner = this.winnerService.getWinnerByDate(this.date, this.digits);

  this.winner = winner
    ? this.winnerService.syncPrizesWithSettings(structuredClone(winner))
    : null;
}

  onDateChange(): void {
    this.searchWinners();
  }

  onDigitsChange(): void {
    this.searchWinners();
  }

  goToRegister(): void {
    this.router.navigateByUrl('/winners');
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
