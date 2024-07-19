import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../api.service';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FormControl, NgForm } from '@angular/forms';
import { debounceTime, distinctUntilChanged, finalize, startWith, switchMap, tap } from 'rxjs/operators';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { MatSliderModule } from '@angular/material/slider';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTabsModule} from '@angular/material/tabs';
import { HighchartsChartModule } from 'highcharts-angular';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { SearchDetailsComponent } from '../search-details/search-details.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, ReactiveFormsModule, FormsModule, MatSliderModule, FontAwesomeModule, MatAutocompleteModule, MatProgressSpinnerModule, MatTabsModule, HighchartsChartModule, NgbModule, SearchDetailsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  faS = faSearch;
  faT = faTimes;
  isLoading = false;
  results: any = null;
  queryField: FormControl = new FormControl();
  query: any;
  ticker: string | undefined;
  data: any;
  @ViewChild('searchForm')
  searchForm!: NgForm;
  autoLoading: boolean = false; // track autcomplete loading state
  searchLoading: boolean = false; // track search loading state
  showDetailComponent: boolean = false;
  searchResult: any;

  constructor(private apiService: ApiService, private router:Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.queryField.valueChanges.pipe(
      debounceTime(500)
    ).subscribe((query: string) => {
      if (!query) {
        this.results = null;
        return;
      }
      this.isLoading = true;
      this.getResults(query.trim()).subscribe(
        (data: any) => {
          setTimeout(() => {}, 500);
          this.isLoading = false;
          this.results = data.result;
        },
        () => {
          this.isLoading = false;
          this.results = null;
        }
      );
    });

    this.activatedRoute.params.subscribe(params => {
      const ticker = params['ticker'];
      if (ticker) {
        this.searchLoading = true;
        this.fetchDetails(ticker);
      }
    });

  }

  getResults(query: string) {
    return this.apiService.search(query);
  }

  selectResult(result: any) {
    this.ticker = result.displaySymbol;
    this.queryField.setValue(result.displaySymbol);
    this.queryField.setValue(this.queryField.value);
  }

  searchTicker(event: any){
    event.preventDefault();
    event.returnValue = false;
    
    this.router.navigate(['/search', this.ticker]);
  }

  reset() {
    this.queryField.setValue('');
  }

  fetchDetails(ticker: string) {
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
    ]).subscribe(([d1, d2, d3, d4, d5, d6, d7, d8, d9]) => {
      console.log("profile:", d1);
      console.log("hourly:", d2);
      console.log("history:", d3);
      console.log("quote:", d4);
      console.log("news:", d5);
      console.log("trends:", d6);
      console.log("insider:", d7);
      console.log("peers:", d8);
      console.log("earnings:", d9);

      // remove peer with "." in symbol
      d8 = (d8 as string[]).filter((peer) => !peer.includes("."));

      this.searchResult = {
        profile: d1,
        hourly: d2,
        history: d3,
        quote: d4,
        news: d5,
        trends: d6,
        insider: d7,
        peers: d8,
        earnings: d9
      };
      this.searchLoading = false;
      this.showDetailComponent = true;
    });
  }
}
