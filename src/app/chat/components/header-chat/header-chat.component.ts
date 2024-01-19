import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-header-chat',
  templateUrl: './header-chat.component.html',
  styleUrls: ['./header-chat.component.css']
})
export class HeaderChatComponent {
  @Input() nameUser: string;
  @Input() urlImage: string;

}
