import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, finalize, startWith, switchMap, tap } from 'rxjs/operators';
import { RouterModule } from '@angular/router';
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

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, ReactiveFormsModule, FormsModule, MatSliderModule, FontAwesomeModule, MatAutocompleteModule, MatProgressSpinnerModule, MatTabsModule, HighchartsChartModule, NgbModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  faS = faSearch;
  isLoading = false;
  results: any = null;
  queryField: FormControl = new FormControl();
  query: any;
  ticker: string | undefined;
  data: any;

  constructor(private apiService: ApiService) {}

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
  }

  getResults(query: string) {
    return this.apiService.search(query);
  }

  selectResult(result: any) {
    this.ticker = result.displaySymbol;
    this.queryField.setValue(result.displaySymbol);
  }
}
