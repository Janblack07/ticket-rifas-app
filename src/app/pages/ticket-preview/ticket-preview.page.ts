import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonText,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  homeOutline,
  printOutline,
  ticketOutline,
} from 'ionicons/icons';
import { QRCodeComponent } from 'angularx-qrcode';

import { Ticket } from '../../core/interfaces/ticket.interface';
import { TicketService } from '../../core/services/ticket.service';
import { SettingsService } from '../../core/services/settings.service';
import { PrintService } from '../../core/services/print.service';

@Component({
  selector: 'app-ticket-preview',
  templateUrl: './ticket-preview.page.html',
  styleUrls: ['./ticket-preview.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonButton,
    IonText,
    IonIcon,
    QRCodeComponent,
  ],
})
export class TicketPreviewPage implements OnInit {

  private readonly ticketService = inject(TicketService);
  private readonly settingsService = inject(SettingsService);
  private readonly router = inject(Router);
  private readonly printService = inject(PrintService);

  ticket: Ticket | null = null;
  isPrinting = false;
  printErrorMessage = '';

  readonly settings = this.settingsService.settings;

  constructor() {
    addIcons({
      arrowBackOutline,
      homeOutline,
      printOutline,
      ticketOutline,
    });
  }

  ngOnInit(): void {
    this.ticket = this.ticketService.getLastTicket();

    if (!this.ticket) {
      this.router.navigateByUrl('/generate-ticket', { replaceUrl: true });
    }
  }

  async printTicket(): Promise<void> {
  if (!this.ticket) {
    return;
  }

  this.isPrinting = true;
  this.printErrorMessage = '';

  try {
    await this.printService.printTicket(
      'ticketReceipt',
      this.settings().paperSize,
      this.ticket.id
    );
  } catch (error) {
    this.printErrorMessage =
      error instanceof Error
        ? error.message
        : 'No se pudo preparar el ticket para imprimir.';
  } finally {
    this.isPrinting = false;
  }
}

  goBack(): void {
    this.router.navigateByUrl('/generate-ticket');
  }

  goHome(): void {
    this.router.navigateByUrl('/home');
  }

  getShortCode(ticketId: string): string {
    return ticketId.slice(0, 8).toUpperCase();
  }
}
