import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  host: string = 'http://localhost:8080';

  autcompleteURL: string = '/company-autocomplete';
  chartTwoYearDailyDataURL: string = '/company-historical-data';
  chartFiveDaysHourlyDataURL: string = '/company-historical-data-hourly';
  descriptionURL: string = '/company-description';
  stockQuoteURL: string = '/company-stock-quote';
  peersURL: string = '/company-peers';
  newsURL: string = '/company-news';
  recommendationTrendsURL: string = '/company-recommendation-trends';
  insiderSentimentURL: string = '/company-insider-sentiment';
  earningsURL: string = '/company-earnings';

  wishlistURL: string = '/wishlist';
  addWishlistURL: string = '/add-wishlist';
  deleteWishlistURL: string = '/delete-wishlist';
  portfolioURL: string = '/portfolio';
  updatePortfolioURL: string = '/update-portfolio';
  moneyURL: string = '/money';
  updateMoneyURL: string = '/update-money';

  constructor(private httpClient: HttpClient) { }

  get(url: string, params?: HttpParams) {
    return this.httpClient.get<any>(url, { params });
  }

  post(url: string, body: any) {
    return this.httpClient.post<any>(url, body, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  search(ticker: string){
    const params = new HttpParams().set('symbol', ticker);
    return this.get(this.host + this.autcompleteURL, params);
  }

  chartTwoYearDailyData(ticker: string){
    const params = new HttpParams().set('symbol', ticker);
    return this.get(this.host + this.chartTwoYearDailyDataURL, params);
  }

  chartFiveDaysHourlyData(ticker: string){
    const params = new HttpParams().set('symbol', ticker);
    return this.get(this.host + this.chartFiveDaysHourlyDataURL, params);
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
  
  recommendationTrends(ticker: string){
    const params = new HttpParams().set('symbol', ticker);
    return this.get(this.host + this.recommendationTrendsURL, params);
  }

  insiderSentiment(ticker: string){
    const params = new HttpParams().set('symbol', ticker);
    return this.get(this.host + this.insiderSentimentURL, params);
  }

  earnings(ticker: string){
    const params = new HttpParams().set('symbol', ticker);
    return this.get(this.host + this.earningsURL, params);
  }

  wishlist() {
    return this.get(this.host + this.wishlistURL);
  }

  addWishlist(ticker: string, stockName: string) {
    const data = { ticker: ticker, stockName: stockName};
    return this.post(this.host + this.addWishlistURL, data);
  }

  deleteWishlist(ticker: string) {
    const data = { ticker: ticker};
    return this.post(this.host + this.deleteWishlistURL, data);
  }

  portfolio() {
    return this.get(this.host + this.portfolioURL);
  }

  updatePortfolio(ticker: string, quantity: number, cost: number) {
    const data = { ticker: ticker, quantity: quantity, cost: cost};
    return this.post(this.host + this.updatePortfolioURL, data);
  }

  money() {
    return this.get(this.host + this.moneyURL);
  }

  updateMoney(money: number) {
    const data = { money: money};
    console.log(data);
    return this.post(this.host + this.updateMoneyURL, data);
  }

}
