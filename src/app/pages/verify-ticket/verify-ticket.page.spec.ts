import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerifyTicketPage } from './verify-ticket.page';

describe('VerifyTicketPage', () => {
  let component: VerifyTicketPage;
  let fixture: ComponentFixture<VerifyTicketPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyTicketPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
