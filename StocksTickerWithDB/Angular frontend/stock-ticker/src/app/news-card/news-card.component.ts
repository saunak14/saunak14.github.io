import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NewsData } from '../objects.interface';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { faXTwitter, faFacebook} from '@fortawesome/free-brands-svg-icons';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-news-card',
  standalone: true,
  imports: [FaIconComponent, DatePipe],
  templateUrl: './news-card.component.html',
  styleUrl: './news-card.component.css'
})
export class NewsCardComponent {
  @Input() news!: NewsData;
  icon1 = faXTwitter;
  icon2 = faFacebook;

  constructor(public activeModal: NgbActiveModal, library: FaIconLibrary){
    library.addIcons(faXTwitter);
  }

  closeModal() {
    this.activeModal.dismiss();
  }

}
