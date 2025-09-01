import { Component } from '@angular/core';
import { ChatService } from '../servicesComponents/chat.service';

@Component({
  selector: 'app-dashboard-root',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainsComponent {
  title = 'Dashboard config';
  constructor (
    private chatService: ChatService
  ) {
    this.chatService.validarBootActivoEmit();
  }
}
