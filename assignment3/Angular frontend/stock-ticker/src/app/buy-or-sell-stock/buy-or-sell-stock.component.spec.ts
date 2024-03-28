import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyOrSellStockComponent } from './buy-or-sell-stock.component';

describe('BuyOrSellStockComponent', () => {
  let component: BuyOrSellStockComponent;
  let fixture: ComponentFixture<BuyOrSellStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuyOrSellStockComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BuyOrSellStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
