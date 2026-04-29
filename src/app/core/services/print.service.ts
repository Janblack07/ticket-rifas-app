import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root',
})
export class PrintService {
  async printTicket(
    elementId: string,
    paperSize: '58mm' | '80mm',
    ticketId: string
  ): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await this.shareTicketAsPdf(elementId, paperSize, ticketId);
      return;
    }

    window.print();
  }

  private async shareTicketAsPdf(
    elementId: string,
    paperSize: '58mm' | '80mm',
    ticketId: string
  ): Promise<void> {
    const element = document.getElementById(elementId);

    if (!element) {
      throw new Error('No se encontró el ticket para imprimir.');
    }

    const canvas = await html2canvas(element, {
      scale: 3,
      backgroundColor: '#ffffff',
      useCORS: true,
    });

    const imageData = canvas.toDataURL('image/png');

    const pdfWidth = paperSize === '58mm' ? 58 : 80;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [pdfWidth, pdfHeight],
    });

    pdf.addImage(imageData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    const pdfBase64 = pdf.output('datauristring').split(',')[1];

    const shortId = ticketId.slice(0, 8).toUpperCase();
    const fileName = `ticket-${shortId}.pdf`;

    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: pdfBase64,
      directory: Directory.Cache,
    });

    await Share.share({
      title: 'Ticket de rifa',
      text: 'Ticket generado por 4 Ases.',
      url: savedFile.uri,
      dialogTitle: 'Imprimir o compartir ticket',
    });
  }
}
