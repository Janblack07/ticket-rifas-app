import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GenerateTicketPage } from './generate-ticket.page';

describe('GenerateTicketPage', () => {
  let component: GenerateTicketPage;
  let fixture: ComponentFixture<GenerateTicketPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateTicketPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
