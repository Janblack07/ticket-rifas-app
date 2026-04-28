import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-ticket-preview',
  templateUrl: './ticket-preview.page.html',
  styleUrls: ['./ticket-preview.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class TicketPreviewPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
