import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../api.service';
import { MatDialog } from '@angular/material/dialog';
import { BuyOrSellStockComponent } from '../buy-or-sell-stock/buy-or-sell-stock.component';

@Component({
  selector: 'app-stock-portfolio',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './stock-portfolio.component.html',
  styleUrl: './stock-portfolio.component.css'
})
export class StockPortfolioComponent implements OnInit {
  currentMoney = 0;
  isLoading = false;
  emptyPortfolio = false;
  searchResults: any[] = [];
  portfolioStocks: any[] = [];

  constructor (private apiService: ApiService, public dialog: MatDialog){}

  ngOnInit() {
    this.fetchHoldings();
    this.apiService.money().subscribe(result => {
      this.currentMoney = result[0].money;
    });
  }

  fetchHoldings() {
    this.isLoading = true;
    this.apiService.portfolio().subscribe(portfolioStocks => {
      
      if (portfolioStocks.length === 0) {
        this.isLoading = false;
        this.emptyPortfolio = true;
        return;
      }
      portfolioStocks.forEach((stock: any) => {
        this.apiService.stockQuote(stock.ticker).subscribe(data => {
          stock.avgcost = stock.cost / stock.quantity;
          stock.change = stock.avgcost - data.c;
          stock.mv = data.c * stock.quantity;
          this.portfolioStocks.push(stock);
          this.searchResults.push(data);
        });
      });
      this.isLoading = false;
    });
  }

  buy(ticker: string, stockName: string, currentPrice: number, quantity: number, money: number){
    this.openBuySellBox(true, ticker, stockName, currentPrice, quantity, money);
  }
  sell(ticker: string, stockName: string, currentPrice: number, quantity: number, money: number){
    this.openBuySellBox(false, ticker, stockName, currentPrice, quantity, money);
  }

  openBuySellBox(toBuy: boolean, ticker: string, stockName: string, currentPrice: number, quantity: number, money: number) {
    const dialogVar = this.dialog.open(BuyOrSellStockComponent, {
      width: '375px',
      data: { 
        ticker: ticker,
        stockName: stockName,
        isBuying: toBuy,
        currentPrice: currentPrice,
        quantity: quantity,
        money: money
       }
    });

    dialogVar.afterClosed().subscribe(result => {
      this.searchResults = [];
      this.portfolioStocks = [];
      this.fetchHoldings();
      this.apiService.money().subscribe(result => {
        this.currentMoney = result[0].money;
      });
    });
  }


  }
