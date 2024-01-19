import { Component, ElementRef, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MessageResponse } from '../../models/responses/message.response';

@Component({
  selector: 'app-list-messages',
  templateUrl: './list-messages.component.html',
  styleUrls: ['./list-messages.component.css']
})
export class ListMessagesComponent implements OnInit {

  public showUserImage: boolean;

  @Input() messages: MessageResponse[];

  @ViewChildren('messagesContainer') messagesContainer: QueryList<ElementRef>;

  ngOnInit(): void {
    this.showUserImage = true;
  }

  ngAfterViewChecked() {
    this.scrollMessagesToBottom();
  }

  public clicouExpandirImagem(): void {
    this.showUserImage = !this.showUserImage;
  }

  private scrollMessagesToBottom(): void {
    if (this.messagesContainer?.length > 0) {
      const messagesContainerElement = this.messagesContainer.first.nativeElement;
      messagesContainerElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }
}
