import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../api.service';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FormControl, NgForm } from '@angular/forms';
import { debounceTime, distinctUntilChanged, finalize, startWith, switchMap, tap } from 'rxjs/operators';
import { RouterModule, Router } from '@angular/router';
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
  faT = faTimes;
  isLoading = false;
  results: any = null;
  queryField: FormControl = new FormControl();
  query: any;
  ticker: string | undefined;
  data: any;
  @ViewChild('searchForm')
  searchForm!: NgForm;

  constructor(private apiService: ApiService, private router:Router) {}

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

  searchTicker(event: any){
    event.preventDefault();
    event.returnValue = false;
    this.router.navigate(['/search', this.ticker]);
  }

  reset() {
    this.queryField.setValue('');
  }
}
