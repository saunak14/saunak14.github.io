import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  host: string = 'http://localhost:8080';

  autcompleteURL: string = '/company-autocomplete';
  descriptionURL: string = '/company-description';
  stockQuoteURL: string = '/company-stock-quote';
  peersURL: string = '/company-peers';
  newsURL: string = '/company-news';

  constructor(private httpClient: HttpClient) { }

  get(url: string, params?: HttpParams) {
    return this.httpClient.get<any>(url, { params });
  }

  search(ticker: string){
    const params = new HttpParams().set('symbol', ticker);
    return this.get(this.host + this.autcompleteURL, params);
  }

  description(ticker: string){
    const params = new HttpParams().set('symbol', ticker);
    return this.get(this.host + this.descriptionURL, params);
  }
  
  stockQuote(ticker: string){
    const params = new HttpParams().set('symbol', ticker);
    return this.get(this.host + this.stockQuoteURL, params);
  }

  peers(ticker: string){
    const params = new HttpParams().set('symbol', ticker);
    return this.get(this.host + this.peersURL, params);
  }

  news(ticker: string){
    const params = new HttpParams().set('symbol', ticker);
    return this.get(this.host + this.newsURL, params);
  }

  

}
