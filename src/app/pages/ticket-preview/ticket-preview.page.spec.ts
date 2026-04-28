import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketPreviewPage } from './ticket-preview.page';

describe('TicketPreviewPage', () => {
  let component: TicketPreviewPage;
  let fixture: ComponentFixture<TicketPreviewPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketPreviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
