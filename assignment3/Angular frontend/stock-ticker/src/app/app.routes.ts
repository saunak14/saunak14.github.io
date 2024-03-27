import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SearchResultsComponent } from './search-results/search-results.component';
import { SearchDetailsComponent } from './search-details/search-details.component';
import { SearchPageComponent } from './search-page/search-page.component';

export const routes: Routes = [
    { path: '', redirectTo: 'search/home', pathMatch: 'full' },
    {
        path: 'search/home',
        component: SearchPageComponent
    },
    {path:"search/:ticker", component: SearchPageComponent}
];
