import { Injectable } from '@angular/core';
import {
  Barcode,
  BarcodeFormat,
  BarcodeScanner,
} from '@capacitor-mlkit/barcode-scanning';
import { Capacitor } from '@capacitor/core';

export interface QrScannerResult {
  ok: boolean;
  content?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class QrScannerService {
  async scanQrCode(): Promise<QrScannerResult> {
    if (!Capacitor.isNativePlatform()) {
      return {
        ok: false,
        message:
          'El escáner con cámara debe probarse en Android/iOS. En navegador usa la verificación manual.',
      };
    }

    const permissionResult = await this.ensureCameraPermission();

    if (!permissionResult.ok) {
      return permissionResult;
    }

    try {
      const result = await BarcodeScanner.scan({
        formats: [BarcodeFormat.QrCode],
      });

      const barcode = this.getFirstBarcode(result.barcodes);

      if (!barcode?.rawValue) {
        return {
          ok: false,
          message: 'No se detectó ningún código QR.',
        };
      }

      return {
        ok: true,
        content: barcode.rawValue,
      };
    } catch (error) {
      return {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : 'No se pudo escanear el código QR.',
      };
    }
  }

  private async ensureCameraPermission(): Promise<QrScannerResult> {
    const permissions = await BarcodeScanner.checkPermissions();

    if (permissions.camera === 'granted') {
      return { ok: true };
    }

    const request = await BarcodeScanner.requestPermissions();

    if (request.camera === 'granted') {
      return { ok: true };
    }

    return {
      ok: false,
      message:
        'Permiso de cámara denegado. Activa la cámara desde los ajustes de la aplicación.',
    };
  }

  private getFirstBarcode(barcodes: Barcode[] | undefined): Barcode | null {
    if (!barcodes || barcodes.length === 0) {
      return null;
    }

    return barcodes[0];
  }
}
