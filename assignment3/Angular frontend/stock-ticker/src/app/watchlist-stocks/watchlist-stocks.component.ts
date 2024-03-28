import { Component, OnInit } from '@angular/core';
import { MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
// import { QuoteData } from '../quote.interface';
import { forkJoin } from 'rxjs';
import { ApiService } from '../api.service';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-watchlist-stocks',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule,FontAwesomeModule],
  templateUrl: './watchlist-stocks.component.html',
  styleUrl: './watchlist-stocks.component.css'
})
export class WatchlistStocksComponent implements OnInit {
  faT = faTimes;
  loadingIndicator: boolean = false;
  emptyWatchlist: boolean = false;
  searchResults: any[] = [];
  wishlistStocks: any[] = [];

  constructor(
    private apiService: ApiService
    ) {}

  ngOnInit() {
    this.loadWatchlist();
  }

  loadWatchlist() {
    this.loadingIndicator = true;
    this.apiService.wishlist().subscribe(wishlistStocks => {
      if (wishlistStocks.length === 0) {
        this.loadingIndicator = false;
        this.emptyWatchlist = true;
        return;
      }

      wishlistStocks.forEach((stock: { ticker: string; }) => {
        this.apiService.stockQuote(stock.ticker).subscribe(data => {
          this.wishlistStocks.push(stock);
          this.searchResults.push(data);
        });
      });
      console.log(this.wishlistStocks);
      console.log(this.searchResults);
      this.loadingIndicator = false;
    });
  }
  

  deleteFromWishlist(ticker: string) {
    this.apiService.deleteWishlist(ticker).subscribe(() => {
      this.searchResults = [];
      this.wishlistStocks = [];
      this.loadWatchlist();
    });
  }

}
