import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SearchResultsComponent } from './search-results/search-results.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {path:"details/:ticker", component: SearchResultsComponent}
];
