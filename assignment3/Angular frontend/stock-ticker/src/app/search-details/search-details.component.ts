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

@Component({
  selector: 'app-search-details',
  standalone: true,
  imports: [CommonModule,
    RouterLink,
    MatProgressSpinnerModule,
    HighchartsChartModule,
    MatCardModule,
    MatDialogModule,
    MdbTabsModule,
    MatTabsModule, NewsCardComponent],
  templateUrl: './search-details.component.html',
  styleUrl: './search-details.component.css'
})
export class SearchDetailsComponent {
  @Input() showSearchDetailComponent: boolean = false;
  @Input() stockData: any;
  @Input() autoLoading: boolean = true;
  @Input() searchLoading: boolean = false;

  @ViewChild('modalContent') modalContent!: TemplateRef<any>;

  showError: boolean = false;
  hourlyCharts: typeof Highcharts = Highcharts;
  hourlyConstructor = "stockChart";
  hourlyOptions: Highcharts.Options = {};
  newsData: any[] = [];
  chartCharts: typeof Highcharts = Highcharts;
  chartConstructor = "stockChart";
  chartOptions: Highcharts.Options = {};
  lineColor: string = 'green';
  MSPR: number[] = [];
  CHANGE: number[] = [];
  recommendCharts: typeof Highcharts = Highcharts;
  recommendOptions: Highcharts.Options = {};
  surpriseCharts: typeof Highcharts = Highcharts;
  surpriseOptions: Highcharts.Options = {};
  marketOpen: boolean = true;
  currentTime = new Date().getTime();
  formattedCurrentTime = new Date().toLocaleString();
  formattedQuoteTime = new Date().toLocaleString();

  constructor(
    public dialog: MatDialog,
    private newsModalService: NgbModal,
    ) {}

  // if one of the element in searchResult is empty, show error message
  ngOnChanges(changes: SimpleChanges) {
    if (changes['stockData'] && !changes['stockData'].firstChange) {
      if (!this.searchLoading){
        this.validateData();
      }
      if (this.stockData && !this.searchLoading) {
        this.prepareMarketStatus();
        this.prepareHourlyData();
        this.prepareNewsData();
        this.prepareChartData();
        this.prepareInsightsData();
      }
    }
  }

  prepareMarketStatus() {
    // if current time is 5 minutes after the quote timestamp, the market is closed, otherwise it is open
    const quoteTime = this.stockData.quote.t * 1000;
    const marketCloseTime = new Date(quoteTime).getTime() + 5 * 60 *1000;
    this.currentTime = new Date().getTime();
    this.marketOpen = this.currentTime < marketCloseTime;

    let date = new Date(quoteTime);
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0'); // +1 because getMonth() returns month from 0-11
    let day = date.getDate().toString().padStart(2, '0');
    let hours = date.getHours().toString().padStart(2, '0');
    let minutes = date.getMinutes().toString().padStart(2, '0');
    let seconds = date.getSeconds().toString().padStart(2, '0');
    
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    this.formattedQuoteTime = formattedDate;

    date = new Date(this.currentTime);
    year = date.getFullYear();
    month = (date.getMonth() + 1).toString().padStart(2, '0'); // +1 because getMonth() returns month from 0-11
    day = date.getDate().toString().padStart(2, '0');
    hours = date.getHours().toString().padStart(2, '0');
    minutes = date.getMinutes().toString().padStart(2, '0');
    seconds = date.getSeconds().toString().padStart(2, '0');

    const formattedCurrentTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    this.formattedCurrentTime = formattedCurrentTime;
    
  }

  prepareHourlyData() {
    const data = this.stockData.hourly;

    // market open: show stock price variation from yesterday to the today
    // market close: show stock price variation from one day before closing to the date when the market was closed.
    // get 32 data points for the chart
    const priceData: [number, number][] = [];
    for (let i = data.results.length-1; i >=0 ; i--){
      priceData.unshift([data.results[i].t, data.results[i].c]);
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
        text: data.ticker + ' Hourly Price Variation',
        style: {
          color: 'gray',
        },
      },
      xAxis: {
        type: 'datetime',
      },
      series: [{
        name: data.ticker,
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

  // check if any element in searchResult is empty
  private validateData() {
    this.showError = false;
    if (this.stockData) {
      for (let key in this.stockData) {
        const value = this.stockData[key];
        if (Array.isArray(value) && value.length === 0) {
          this.showError = true;
          console.log("Validate error")
          return;
        }
        if (typeof value === 'object' && Object.keys(value).length === 0) {
          this.showError = true;
          console.log("Validate error")
          return;
        }
      }
    }
    console.log("No validate error")
  }

  // open dialog when card is clicked
  openDialog(templateRef: TemplateRef<any>, cardData: any): void {
    const dialogRef = this.dialog.open(templateRef, {
      width: '250px',
      data: {index: cardData} // Passing the card index or any other relevant data
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  // get first 20 news without null element
  prepareNewsData() {
    const news = this.stockData.news || [];
    const filteredNewsData = news.filter((newsItem: NewsData) => {
        return newsItem.category && 
               newsItem.datetime && 
               newsItem.headline && 
               newsItem.id && 
               newsItem.image &&
               newsItem.related && 
               newsItem.source && 
               newsItem.summary && 
               newsItem.url;
    }).slice(0, 20); // Keep only the first 20 items

    this.newsData = filteredNewsData;
  }

  // pass news data to modal component
  openModal(newsItem: NewsData) {
    const newsModalRef = this.newsModalService.open(NewsCardComponent);
    newsModalRef.componentInstance.news = newsItem;
  }

  // prepare chart data
  prepareChartData() {
    const data = this.stockData.history.results;
    const ohlc = [], volume = [], dataLength = data.length
    const groupingUnits: [string, number[] | null][] = [
      ['month', [1, 3, 6]], // unit, allowed multiples
      ['year', [1]]
    ];

    for (let i = 0; i < dataLength; i += 1) {
        ohlc.push([
            data[i].t, // the date
            data[i].o, // open
            data[i].h, // high
            data[i].l, // low
            data[i].c // close
        ]);

        volume.push([
            data[i].t, // the date
            data[i].v // the volume
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
          selected: 2, // set 6m as default
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
          data: ohlc
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

  prepareInsightsData(){
    // insider data
    let data = this.stockData.insider.data;
    let mspr = 0, pos = 0, neg = 0;
    let change = 0, c_pos = 0, c_neg = 0;
    for (let i = 0; i < data.length; i++){
      mspr += data[i].mspr;
      change += data[i].change;
      if (data[i].mspr > 0){
        pos += data[i].mspr;
        c_pos += data[i].change;
      }
      else{
        neg += data[i].mspr;
        c_neg += data[i].change;
      }
      this.MSPR = [Number(mspr.toFixed(2)), Number(pos.toFixed(2)), Number(neg.toFixed(2))];
      this.CHANGE = [Number(change.toFixed(2)), Number(c_pos.toFixed(2)), Number(c_neg.toFixed(2))]
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
  buyStock(){

  }
  sellStock(){

  }
}
