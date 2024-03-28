import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-buy-or-sell-stock',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormField, MatDialogModule, MatFormFieldModule, MatInputModule],
  templateUrl: './buy-or-sell-stock.component.html',
  styleUrl: './buy-or-sell-stock.component.css'
})
export class BuyOrSellStockComponent {
  buy = false;
  currentPrice: number = 0;
  currentMoney: number = 0;
  totalCost: number = 0;
  quantity: number = 0;
  isNotEnoughMoney: boolean = false;
  isNotEnoughStockHolding: boolean = false;

  tradeQuantity = 0;
  ticker = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<BuyOrSellStockComponent>,
    private apiService: ApiService
  ) {
    this.currentPrice = data.currentPrice;
    this.currentMoney = data.money;
    this.ticker = data.ticker;
    this.buy = data.isBuying;
    this.quantity = data.quantity;
  }

  quantityChange(newQuantity: number): void {
    this.tradeQuantity = newQuantity;
    this.totalCost = this.tradeQuantity * this.currentPrice;
    this.isNotEnoughMoney = this.currentMoney < this.totalCost;
    this.isNotEnoughStockHolding = this.tradeQuantity > this.quantity;
  }
  
  onTradeClick(): void {
    if(this.buy) {
      this.apiService.updatePortfolio(this.ticker, this.tradeQuantity, this.currentPrice * this.tradeQuantity)
      .subscribe({
        next: (result) => {
          this.apiService.updateMoney(this.currentMoney - this.currentPrice * this.tradeQuantity).subscribe({});
          this.dialogRef.close();
        }
      });
    } else {
      this.apiService.updatePortfolio(this.ticker, -this.tradeQuantity, this.currentPrice * this.tradeQuantity * -1)
        .subscribe({
          next: (result) => {
            this.apiService.updateMoney(this.currentMoney + this.currentPrice * this.tradeQuantity).subscribe({});
            this.dialogRef.close();
          }
        });
    }
  }

  getMoney(): any {
    this.apiService.money().subscribe(result => {
      console.log(result[0].money);
      return result[0].money;
    });
  }

  close(): void {
    this.dialogRef.close();
  }

}
