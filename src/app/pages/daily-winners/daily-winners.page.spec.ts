import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DailyWinnersPage } from './daily-winners.page';

describe('DailyWinnersPage', () => {
  let component: DailyWinnersPage;
  let fixture: ComponentFixture<DailyWinnersPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DailyWinnersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
