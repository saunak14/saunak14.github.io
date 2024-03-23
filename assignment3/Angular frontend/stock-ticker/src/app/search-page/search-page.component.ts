import { Component, Input, OnInit} from '@angular/core';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule} from '@angular/material/autocomplete';
import { autocompleteOptions } from '../objects.interface';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { SearchDetailsComponent } from '../search-details/search-details.component';
import { ApiService } from '../api.service';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [CommonModule, 
    FormsModule,
    ReactiveFormsModule,
    SearchDetailsComponent,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    FontAwesomeModule],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.css'
})
export class SearchPageComponent implements OnInit {
  faS = faSearch;
  faT = faTimes;
  @Input() ticker: string = "";
  search: string = "";
  stockData: any;
  dropdownOptions: autocompleteOptions[] = [];  
  loading: boolean = false;
  searchLoading: boolean = false;
  showSearchDetailComponent: boolean = false;

  constructor(private apiService: ApiService, private activatedRoute: ActivatedRoute, private router:Router) {}

  ngOnInit(){
    this.activatedRoute.params.subscribe(params => {
      const ticker = params['ticker'];
      if (ticker) {
        this.searchLoading = true;
        this.performSearch(ticker);
        //this.getDescription(ticker);
      }
    });
  }

  private timeout: any = null;
  onTextInput(event: any) {
    const ticker = event.target.value;
    this.search = ticker;
  
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  
    this.timeout = setTimeout(() => {
      if (ticker) {
        this.loading = true;
        this.dropdownOptions = [];
        this.apiService.search(ticker)
          .subscribe((response) => {
            const autocompleteSearch = response as { count: number, result: autocompleteOptions[] };
            autocompleteSearch.result = autocompleteSearch.result.filter((option) => !option.symbol.includes(".") && option.type === "Common Stock" );
            this.dropdownOptions = autocompleteSearch.result;
            this.loading = false;
          });
      } else {
        this.dropdownOptions = [];
      }
    }, 500);
  }

  onOptionSelected(event: any): void {
    event.returnValue = false;
    const selectedValue = event.option.value;
    this.router.navigate(['/search', selectedValue]);
  }

  onSubmit(event: any) {
    event.preventDefault();
    event.returnValue = false;
    this.search = this.ticker;
    this.router.navigate(['/search', this.search]);
  }

  performSearch(ticker: string) {
    forkJoin([
      this.apiService.description(ticker),
      this.apiService.chartFiveDaysHourlyData(ticker),
      this.apiService.chartTwoYearDailyData(ticker),
      this.apiService.stockQuote(ticker),
      this.apiService.news(ticker),
      this.apiService.recommendationTrends(ticker),
      this.apiService.insiderSentiment(ticker),
      this.apiService.peers(ticker),
      this.apiService.earnings(ticker),
    ]).subscribe(([data1, data2, data3, data4, data5, data6, data7, data8, data9]) => {
      data8 = (data8 as string[]).filter((peer) => !peer.includes("."));

      this.stockData = {
        description: data1,
        hourly: data2,
        history: data3,
        quote: data4,
        news: data5,
        trends: data6,
        insider: data7,
        peers: data8,
        earnings: data9
      };
      this.searchLoading = false;
      this.showSearchDetailComponent = true;
    });
  }
  

  getDescription(ticker: string){
    this.apiService.description(this.ticker).subscribe(data => {
      this.stockData = {description: data};
      this.getChartFiveDaysHourlyData(this.ticker);
    });
  }

  getChartTwoYearDailyData(ticker: string){
    this.apiService.chartTwoYearDailyData(this.ticker).subscribe(data => {
      this.stockData["hourly"] = data;
      this.getChartFiveDaysHourlyData(this.ticker);
    });
  }

  getChartFiveDaysHourlyData(ticker: string){
    this.apiService.chartFiveDaysHourlyData(this.ticker).subscribe(data => {
      this.stockData["history"] = data;
      this.getStockQuote(this.ticker);
    });
  }

  getStockQuote(ticker: string){
    this.apiService.stockQuote(this.ticker).subscribe(data => {
      this.stockData["quote"] = data;
      this.getNews(this.ticker);
    });
  }

  getNews(ticker: string){
    this.apiService.news(this.ticker).subscribe(data => {
      this.stockData["news"] = data;
      this.getRecommendationTrends(this.ticker);
    });
  }

  getRecommendationTrends(ticker: string){
    this.apiService.recommendationTrends(this.ticker).subscribe(data => {
      this.stockData["trends"] = data;
      this.getInsiderSentiment(this.ticker);
    });
  }

  getInsiderSentiment(ticker: string){
    this.apiService.insiderSentiment(this.ticker).subscribe(data => {
      this.stockData["insider"] = data;
      this.getPeers(this.ticker);
    });
  }

  getPeers(ticker: string){
    this.apiService.peers(this.ticker).subscribe(data => {
      this.stockData["peers"] = data;
      this.getEarnings(this.ticker);
    });
  }

  getEarnings(ticker: string){
    this.apiService.earnings(this.ticker).subscribe(data => {
      this.stockData["earnings"] = data;
      console.log(this.stockData);
      this.showSearchDetailComponent = true;
      this.searchLoading = false;
    });
  }

  

  

  // reset
  reset() {
    console.log("Resetting search component");
    this.stockData = null;
    this.dropdownOptions = [];
    this.showSearchDetailComponent = false;
    this.router.navigate(['/search']);
    this.search = '';
    this.loading = false;
    this.searchLoading = false;
  }

}
