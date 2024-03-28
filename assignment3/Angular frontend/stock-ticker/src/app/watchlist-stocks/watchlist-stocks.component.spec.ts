import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WatchlistStocksComponent } from './watchlist-stocks.component';

describe('WatchlistStocksComponent', () => {
  let component: WatchlistStocksComponent;
  let fixture: ComponentFixture<WatchlistStocksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WatchlistStocksComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WatchlistStocksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
