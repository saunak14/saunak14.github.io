import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { interval } from 'rxjs';
import * as Highcharts from "highcharts/highstock";
import { HighchartsChartModule } from 'highcharts-angular';
import { Options } from "highcharts/highstock";
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {faFacebookSquare, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { ApiService } from '../api.service';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTabsModule} from '@angular/material/tabs';
import { HomeComponent } from '../home/home.component';

interface NewsData {
  news: News[];
}

interface News {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [HomeComponent, CommonModule, MatProgressSpinnerModule, MatTabsModule, HighchartsChartModule, FontAwesomeModule, FormsModule, ReactiveFormsModule],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.css'
})
export class SearchResultsComponent implements OnInit {
  ticker: any;
  detailsLoading: any;
  summaryLoading: any ;
  newsLoading: any;
  chartLoading: any;
  updateFlag: boolean = false;
  ddata: any;
  sdata: any;
  ndata: NewsData | undefined;
  nndata: NewsData | undefined;
  peers: string[] = [];
  ndatalen: any;
  details: any;
  summary: any;
  stock_up: boolean = true;
  mopen: boolean = true;
  startDate: any;
  closeResult = '';
  interval = interval(15000);
  isBuyDisabled = true;
  quantityVal: FormControl = new FormControl();
  totalPrice: any;
  faFace = faFacebookSquare;
  faTwit = faTwitter; 
  isSelected = false;
  present = false;
  isEmpty = false;
  res: any;
  x: any;
  Highcharts: typeof Highcharts = Highcharts; 
  // chartOptions: Options;
  chartOptions: Options = { 
    title: {
      text:'ABC'
    },
    rangeSelector: {
      enabled: false
    },
    yAxis: {
      title: {
        text: ''
      },
      opposite: true
    },
    series: [{
      color: '#28a745',
      data:[],
      type: 'line'
    }],
    time: {
      useUTC: false
    }
   };
  

  constructor(
    private route: ActivatedRoute,
    private getdata: ApiService,
    private modalService: NgbModal
  ) {
      
   }
   ngOnInit(): void {

    this.ticker = this.route.snapshot.paramMap.get('ticker');
    this.detailsLoading = true;
    this.newsLoading = true;
    this.summaryLoading = true;
    this.chartLoading = true;

    console.log(this.ticker);
    var watchlist = localStorage.getItem('watchlist');
    if(watchlist) {
      var arr = JSON.parse(watchlist);
    }
    if(!(arr instanceof Array))
      arr = [arr];
    if(arr.includes(this.ticker.toUpperCase())){
      this.present = true;
    }
    this.getDescription(this.ticker);
  
  }


  repeat() {
    this.getDescription(this.ticker);
    this.getSummary(this.ticker);
  }

  getDescription(ticker: string){
    this.getdata.description(this.ticker).subscribe(data => {
      this.details = data;
      this.ddata = data;
      this.ddata.name = this.details.name;
      this.ddata.eCode = this.details.exchange;
      this.ddata.startDate = this.details.ipo;
      this.ddata.description = this.details.finnhubIndustry;
      this.ddata.weburl = this.details.weburl;

      this.detailsLoading = false;
      this.getSummary(this.ticker);
    });
  }

  getSummary(ticker: string){
    this.getdata.stockQuote(this.ticker).subscribe(data => {
      this.summary = data;
      this.sdata = data;
      this.ddata.last = this.summary.c;
      if(parseFloat(this.summary.d) < 0) this.stock_up = false;
      if (this.hasFiveMinutesElapsed(this.summary.t)) {
        this.ddata.mStatus = 'closed'
      }
      else {
        this.ddata.mStatus = 'open'
      }
      this.ddata.change = this.summary.d;
      this.ddata.changePercent = this.summary.dp;
      this.ddata.lastTime = this.formatDateFromEpoch(this.summary.t);
      this.ddata.currentTime = this.formattedCurrentDate();

      this.sdata.high = this.summary.h;
      this.sdata.low = this.summary.l;
      this.sdata.open = this.summary.o;
      this.sdata.close = this.summary.pc;

      this.summaryLoading = false;
      this.getPeers(this.ticker);
    });
  }

  // getChart(ticker: string){
    
  //   this.getdata.charts(ticker).subscribe(data => {
  //     console.log(data[0]);
  //   //   var output = [];
  //   //   for(var i=0;i<Object.keys(data).length;i++){
  //   //     output.push([data[i]]);
  //   // }
  //   // console.log(output[0]);
  //     this.chartLoading = false;
  //     this.chartOptions.series[0]['data'] = data;

  //     this.chartOptions.title.text = this.ticker.toUpperCase();
  //     if(this.stock_up){
  //       this.chartOptions.series[0]['color'] = 'green';
  //       }
  //       else {
  //       this.chartOptions.series[0]['color'] = 'red';}
     
  //     this.updateFlag = true;
  //   });
  // }

  getNews(ticker: string){
    this.getdata.news(ticker).subscribe(data => {
      this.ndata = data;
      console.log(this.ndata);
      console.log(this.ndata?.news);
      if(this.ndata && this.ndata.news) {
        if(this.ndata.news.length % 2 == 1){
          this.ndatalen = Math.ceil(this.ndata.news.length / 2);
          }
          else{
            this.ndatalen = this.ndata.news.length / 2;
          }
      }
      this.newsLoading = false;
      this.chartLoading = false;
    });
  }

  getPeers(ticker: string){
    this.getdata.peers(this.ticker).subscribe(data => {
      this.peers = data;
      this.getNews(this.ticker);
    });
  }


  open(content: any) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
    this.quantityVal.valueChanges.subscribe(val => {
        if(this.quantityVal.value > 0){
          this.isBuyDisabled = false;
        }
        else{
          this.isBuyDisabled = true;
        }
        this.totalPrice =  this.quantityVal.value * parseFloat(this.ddata.last);

    });
  }

  open2(newscontent: any) {
    this.modalService.open(newscontent, {ariaLabelledBy: 'modal-newstitle'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
    
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }


  storeBought(){
    
    var obj = {
      'ticker': this.ticker.toUpperCase(),
      'totalcost': this.totalPrice,
      'quantity': parseInt(this.quantityVal.value),
      
    };

    // if(!localStorage.getItem('portfolio')){
    //   localStorage.setItem('portfolio', JSON.stringify([]));
    // }
    var portfolio = localStorage.getItem('portfolio');
    if(portfolio) {
      var port = JSON.parse(portfolio);
    }
    if(!(port instanceof Array))
      port = [port];
    
    for(var i=0;i<port.length;i++){
      if(port[i]['ticker'] == this.ticker){
        port[i]['quantity'] += parseFloat(this.quantityVal.value);
        port[i]['totalcost'] += this.totalPrice;
        localStorage.setItem('portfolio', JSON.stringify(port));
        return;
      }
    }
    port.push(obj)
    var str  =JSON.stringify(port);

    
    localStorage.setItem('portfolio', str);
  }

  toWatch(){
    var ticker = this.ticker.toUpperCase();
    var portfolio = localStorage.getItem('portfolio');
    if(portfolio) {
      var arr = JSON.parse(portfolio);
    }
    if(!(arr instanceof Array))
      arr = [arr];
    if(arr.includes(ticker)){
      this.present = false;
      var newwatch = arr.filter((e: any) => e !== ticker);
      console.log(newwatch);
      localStorage.setItem('watchlist', JSON.stringify(newwatch));
    }
    else{
      this.present = true;
      arr.push(ticker);
      localStorage.setItem('watchlist', JSON.stringify(arr));
    }
    
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
  

}
