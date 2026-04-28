import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonTextarea,
  IonText,
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  qrCodeOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  trophyOutline,
  warningOutline,
  scanOutline,
  trashOutline,
} from 'ionicons/icons';

import { TicketService } from '../../core/services/ticket.service';
import { QrScannerService } from '../../core/services/qr-scanner.service';
import { TicketVerificationResult } from '../../core/interfaces/ticket-verification.interface';

@Component({
  selector: 'app-verify-ticket',
  templateUrl: './verify-ticket.page.html',
  styleUrls: ['./verify-ticket.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonButton,
    IonIcon,
    IonItem,
    IonTextarea,
    IonText,
  ],
})
export class VerifyTicketPage {
  private readonly router = inject(Router);
  private readonly ticketService = inject(TicketService);
  private readonly qrScannerService = inject(QrScannerService);

  qrPayload = '';
  result: TicketVerificationResult | null = null;
  errorMessage = '';
  isScanning = false;

  constructor() {
    addIcons({
      arrowBackOutline,
      qrCodeOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      trophyOutline,
      warningOutline,
      scanOutline,
      trashOutline,
    });
  }

  async scanQr(): Promise<void> {
    this.errorMessage = '';
    this.result = null;
    this.isScanning = true;

    try {
      const scanResult = await this.qrScannerService.scanQrCode();

      if (!scanResult.ok || !scanResult.content) {
        this.errorMessage =
          scanResult.message || 'No se pudo leer el código QR.';
        return;
      }

      this.qrPayload = scanResult.content;
      this.verify();
    } finally {
      this.isScanning = false;
    }
  }

  verify(): void {
    this.errorMessage = '';
    this.result = null;

    if (!this.qrPayload.trim()) {
      this.errorMessage = 'Pega o escanea el contenido del QR para verificar el ticket.';
      return;
    }

    this.result = this.ticketService.verifyTicketFromQrPayload(
      this.qrPayload.trim()
    );
  }

  clear(): void {
    this.qrPayload = '';
    this.result = null;
    this.errorMessage = '';
  }

  goHome(): void {
    this.router.navigateByUrl('/home');
  }

  getResultClass(): string {
    if (!this.result) {
      return '';
    }

    return `status-${this.result.status}`;
  }

  getResultIcon(): string {
    if (!this.result) {
      return 'qr-code-outline';
    }

    if (this.result.status === 'winner') {
      return 'trophy-outline';
    }

    if (
      this.result.status === 'valid' ||
      this.result.status === 'not-winner' ||
      this.result.status === 'no-winners'
    ) {
      return 'checkmark-circle-outline';
    }

    if (this.result.status === 'expired') {
      return 'warning-outline';
    }

    return 'close-circle-outline';
  }
}
