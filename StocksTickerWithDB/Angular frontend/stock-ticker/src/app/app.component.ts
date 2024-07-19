import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'stock-ticker';

  ngOnInit(){
    if(localStorage.getItem('watchlist') == null){
      localStorage.setItem('watchlist', '[]');
    }
    if(localStorage.getItem('portfolio') == null){
      localStorage.setItem('portfolio', '[]');
    }
  }
}
