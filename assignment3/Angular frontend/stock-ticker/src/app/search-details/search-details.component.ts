import { Component, Input, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts/highstock';
import indicators from 'highcharts/indicators/indicators';
import vbp from 'highcharts/indicators/volume-by-price';
import { MatTabsModule } from '@angular/material/tabs';

import { MdbTabsModule } from 'mdb-angular-ui-kit/tabs';

indicators(Highcharts);
vbp(Highcharts);

import { MatDialog } from '@angular/material/dialog';
import {MatCardModule} from '@angular/material/card';
import {MatDialogModule} from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NewsData } from '../objects.interface';
import { NewsCardComponent } from '../news-card/news-card.component';
import { ApiService } from '../api.service';
import { faL } from '@fortawesome/free-solid-svg-icons';
import { Observable, map } from 'rxjs';
import { BuyOrSellStockComponent } from '../buy-or-sell-stock/buy-or-sell-stock.component';

@Component({
  selector: 'app-search-details',
  standalone: true,
  imports: [CommonModule,
    RouterLink,
    HighchartsChartModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDialogModule,
    MatTabsModule, 
    MdbTabsModule, 
    NewsCardComponent],
  templateUrl: './search-details.component.html',
  styleUrl: './search-details.component.css'
})
export class SearchDetailsComponent {
  @Input() autoLoading: boolean = true;
  @Input() searchLoading: boolean = false;
  @Input() showSearchDetailComponent: boolean = false;
  @Input() stockData: any;

  error: boolean = false;

  hourlyCharts: typeof Highcharts = Highcharts;
  stockChart = "stockChart";
  hourlyOptions: Highcharts.Options = {};
  newsData: any[] = [];
  chartOfCharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};
  lineColor: string = 'green';
  MSPR: number[] = [];
  CHANGE: number[] = [];
  recommendCharts: typeof Highcharts = Highcharts;
  recommendOptions: Highcharts.Options = {};
  surpriseCharts: typeof Highcharts = Highcharts;
  surpriseOptions: Highcharts.Options = {};

  marketOpen: boolean = true;
  stockUp: boolean = true;
  currentTime = new Date().getTime();
  formattedCurrentTime = new Date().toLocaleString();
  formattedMarketCloseTime = new Date().toLocaleString();

  isPresentInWishlist: boolean = false;
  isInPortfolio: boolean = false;
  quantity: number = 0;
  money: number = 0;

  @ViewChild('modalContent') modalContent!: TemplateRef<any>;


  constructor(public dialog: MatDialog, private newsModalService: NgbModal, private apiService: ApiService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['stockData'] && !changes['stockData'].firstChange) {
      if (!this.searchLoading) {
        if (this.showErrorPage()){
          this.error = true;
        }
      }
      if (this.stockData && !this.searchLoading) {
        this.tab1();
        this.tab2();
        this.tab3();
        this.tab4();
      }

      this.getPortfolioAndCheckStock().subscribe(data => {
        this.isInPortfolio = data.isInPortfolio;
        this.quantity = data.quantity;
      });
      this.getMoney();
      
    }
  }

  showErrorPage(): boolean {
    if (this.stockData) {
      for (let data in this.stockData) {
        const value = this.stockData[data];
        if (Array.isArray(value) && this.stockData[data].length === 0 || typeof value === 'object' && Object.keys(value).length === 0) {
          this.error = true;
          return true;
        }
      }
    }
    return false;
  }

  tab1() {
    if (this.hasFiveMinutesElapsed(this.stockData.quote.t)) {
      this.marketOpen = false;
    }
    if(parseFloat(this.stockData.quote.d) < 0) this.stockUp = false;
    this.stockData.quote.dp = Math.round(parseFloat(this.stockData.quote.dp) * 100) / 100 ;

    this.formattedMarketCloseTime = this.formatDateFromEpoch(this.stockData.quote.t);
    this.formattedCurrentTime = this.formattedCurrentDate();

    const chartData = this.stockData.hourly;
    const priceData: [number, number][] = [];
    // Convert data from API into data that can be read by charts
    for (let i = chartData.results.length-1; i >=0 ; i--){
      priceData.unshift([chartData.results[i].t, chartData.results[i].c]);
      if (priceData.length >= 32){
        break;
      }
    }
    if (this.stockData.quote.d > 0){
      this.lineColor = 'green';
    }
    else{
      this.lineColor = 'red';
    }
    this.hourlyOptions = {
      colors: [this.lineColor],
      rangeSelector: {
        enabled: false
      },
      navigator: {
        enabled: false
      },
      title: {
        text: chartData.ticker + ' Hourly Price Variation',
        style: {
          color: 'gray',
        },
      },
      xAxis: {
        type: 'datetime',
      },
      series: [{
        name: chartData.ticker,
        data: priceData,
        type: 'line',
      }],
      tooltip: {
        split: true,
      },
      time: {
        useUTC: false,
        timezone: 'America/Los_Angeles'
      },
      legend: {
        enabled: false
      },
      chart: {
        backgroundColor: '#f4f4f4',
      },
    };
  }

  openDialog(templateRef: TemplateRef<any>, cardData: any): void {
    const dialogRef = this.dialog.open(templateRef, {
      width: '250px',
      data: {index: cardData}
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  tab2() {
    const news = this.stockData.news || [];
    const limitNews = news.filter((newsItem: NewsData) => {
        return newsItem.category && 
               newsItem.datetime && 
               newsItem.headline && 
               newsItem.id && 
               newsItem.image &&
               newsItem.related && 
               newsItem.source && 
               newsItem.summary && 
               newsItem.url;
    }).slice(0, 20);

    this.newsData = limitNews;
  }

  tab3() {
    const data = this.stockData.history.results;
    const stockData = [], 
    volume = [], 
    dataLength = data.length
    const groupingUnits: [string, number[] | null][] = [
      ['month', [1, 3, 6]], // unit, allowed multiples
      ['year', [1]]
    ];

    for (let i = 0; i < dataLength; i += 1) {
        stockData.push([
            data[i].t,
            data[i].o,
            data[i].h,
            data[i].l,
            data[i].c
        ]);

        volume.push([
            data[i].t,
            data[i].v
        ]);
    }

    this.chartOptions = {
        rangeSelector: {
          buttons: [{
              'type': 'month',
              'count': 1,
              'text': '1m',
          }, {
              'type': 'month',
              'count': 3,
              'text': '3m',
          }, {
              'type': 'month',
              'count': 6,
              'text': '6m',
          }, {
              'type': 'ytd',  
              'text': 'YTD',
          }, {
              'type': 'year',
              'count': 1,
              'text': '1Y',
          }, {
              'type': 'all',
              'text': 'All',
          }],
          selected: 2,
        },
        title: { text: this.stockData.history.ticker + ' Historical'},
        subtitle: { text: 'With SMA and Volume by Price technical indicators'},
        xAxis: {
          type: 'datetime'
        },
        yAxis: [{
          startOnTick: false,
          endOnTick: false,
          labels: {
              align: 'right',
              x: -3
          },
          title: {
              text: 'OHLC'
          },
          height: '60%',
          lineWidth: 2,
          resize: {
              enabled: true
          }
      }, {
          labels: {
              align: 'right',
              x: -3
          },
          title: {
              text: 'Volume'
          },
          top: '65%',
          height: '35%',
          offset: 0,
          lineWidth: 2
      }],
      tooltip: {
          split: true
      },
      chart: {
        backgroundColor: '#f4f4f4',
      },
      series: [{
          type: 'candlestick',
          name: this.stockData.history.ticker,
          id: this.stockData.history.ticker,
          zIndex: 2,
          data: stockData
      }, {
          type: 'column',
          name: 'Volume',
          id: 'volume',
          data: volume,
          yAxis: 1
      }, {
          type: 'vbp',
          linkedTo: this.stockData.history.ticker,
          params: {
              volumeSeriesID: 'volume'
          },
          dataLabels: {
              enabled: false
          },
          zoneLines: {
              enabled: false
          }
      }, {
          type: 'sma',
          linkedTo: this.stockData.history.ticker,
          zIndex: 1,
          marker: {
              enabled: false
          }
      }],
      time: {
        useUTC: false,
        timezone: 'America/Los_Angeles'
      },
    }
  }

  tab4(){
    let data = this.stockData.insider.data;
    let pos = 0, neg = 0, mspr = 0;
    let change_pos = 0, change_neg = 0, change = 0;
    for (let i = 0; i < data.length; i++){
      mspr += data[i].mspr;
      change += data[i].change;
      if (data[i].mspr > 0){
        pos += data[i].mspr;
        change_pos += data[i].change;
      }
      else{
        neg += data[i].mspr;
        change_neg += data[i].change;
      }
      this.MSPR = [Number(mspr.toFixed(2)), Number(pos.toFixed(2)), Number(neg.toFixed(2))];
      this.CHANGE = [Number(change.toFixed(2)), Number(change_pos.toFixed(2)), Number(change_neg.toFixed(2))]
    }
    // recommend data
    data = this.stockData.trends;
    let period = [], strongBuy = [], buy = [], hold = [], sell = [], strongSell = [];
    for (let i = 0; i < data.length; i++){
      let length = data[i].period.length;
      period.push(data[i].period.substring(0, length - 3));
      strongBuy.push(data[i].strongBuy);
      buy.push(data[i].buy);
      hold.push(data[i].hold);
      sell.push(data[i].sell);
      strongSell.push(data[i].strongSell); 
    }
    data = this.stockData.recommend;
    this.recommendOptions = {
      chart:{
        type: 'column',
        backgroundColor: '#f4f4f4',
      },
      title: {
        text: 'Recommendation Trends'
      },
      xAxis: {
        categories: period,
        //crosshair: true
      },
      yAxis:{
        min: 0, 
        title:{
          text: '#Analysis'
        },
      },
      plotOptions: {
        column: {
            stacking: 'normal',
            dataLabels: {
                enabled: true
            }
        }
      },
      series: [{
        name: 'Strong Buy',
        data: strongBuy,
        type: 'column',
        color: 'darkgreen',
      },{
        name: 'Buy',
        data: buy,
        type: 'column',
        color: 'green',
      },{
        name: 'Hold',
        data: hold,
        type: 'column',
        color: '#B07E28',
      },{
        name: 'Sell',
        data: sell,
        type: 'column',
        color: 'red',
      },{
        name: 'Strong Sell',
        data: strongSell,
        type: 'column',
        color: 'darkred',
      }],
    }
    // surprise data
    data = this.stockData.earnings;
    period = []
    let actual = [], estimate = [], surprise: Number[] = [];
    for (let i = 0; i < data.length; i++){
      period.push(data[i].period);
      actual.push(data[i].actual);
      estimate.push(data[i].estimate);
      surprise.push(data[i].surprise);
    }
    this.surpriseOptions = {
      chart: {
        type: 'spline',
        backgroundColor: '#f4f4f4',
      },
      title: {
        text: 'Historical EPS Surprises'
      },
      xAxis: {
        categories: period,
        // showLastLabel: true,
        labels: {
          useHTML: true,
          formatter: function () {
            let surpriseValue = surprise[this.pos];
            return '<div style="text-align: center;">' + this.value + '<br><span>Surprise: ' + surpriseValue + '</span></div>';
          }
        }
      },
      yAxis: {
        title: {
          text: 'Quantity EPS'
        },
      },
      series: [{
        name: 'Actual',
        data: actual,
        type: 'spline',
      }, {
        name: 'Estimate',
        data: estimate,
        type: 'spline',
      }]
    }
  }

  buy(){
    this.openBuySellBox(true);
  }
  sell(){
    this.openBuySellBox(false);
  }

  openBuySellBox(toBuy: boolean) {
    const dialogVar = this.dialog.open(BuyOrSellStockComponent, {
      width: '375px',
      data: { 
        ticker: this.stockData.description.ticker, 
        isBuying: toBuy,
        currentPrice: this.stockData.quote.c,
        quantity: this.quantity,
        money: this.money
       }
    });

    dialogVar.afterClosed().subscribe(result => {
      console.log('The dialog was closed. Fetching updates.');
      this.getPortfolioAndCheckStock().subscribe(data => {
        this.isInPortfolio = data.isInPortfolio;
        this.quantity = data.quantity;
      });
      this.getMoney();
    });
  }


  open(newsItem: NewsData) {
    const newsModalRef = this.newsModalService.open(NewsCardComponent);
    newsModalRef.componentInstance.news = newsItem;
  }

  hasFiveMinutesElapsed(epochTime: number): boolean {
    if (!epochTime) {
      return false; // Handle potential undefined values
    }
    const currentTime = new Date().getTime();
    const fiveMinutesInMilliseconds = 5 * 60 * 1000; // 5 minutes in milliseconds
    const timeDifference = currentTime - (epochTime * 1000); // Convert epoch to milliseconds first
  
    return timeDifference >= fiveMinutesInMilliseconds;
  }
  

  formatDateFromEpoch(epochTime: number): string {
    if (!epochTime) {
      return ''; // Handle potential undefined values
    }
    const date = new Date(epochTime * 1000); // Multiply by 1000 for milliseconds
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Pad month for single digits
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  formattedCurrentDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  isInWishlist(): Observable<boolean> {
    return this.apiService.wishlist().pipe(
      map(response => response.some((wishlist: any) => wishlist.ticker === this.stockData.description.ticker))
    );
  }

  addToWishlist() {
    this.apiService.addWishlist(this.stockData.description.ticker, this.stockData.description.name).subscribe({});
    this.isPresentInWishlist = true;
  }

  deleteFromWishlist() {
    this.apiService.deleteWishlist(this.stockData.description.ticker).subscribe({});
    this.isPresentInWishlist = false;
  }
  
  getPortfolioAndCheckStock(): Observable<{ isInPortfolio: boolean; quantity: number }> {
    return this.apiService.portfolio().pipe(
      map(holdings => ({
        isInPortfolio: holdings.some((holding: { ticker: any; }) => holding.ticker === this.stockData.description.ticker),
        quantity: holdings.find((holding: { ticker: any; }) => holding.ticker === this.stockData.description.ticker)?.quantity || 0,
      }))
    );
  }
  
  getMoney() {
    this.apiService.money().subscribe(result => {
      this.money = result[0].money;
    });
  }

}
