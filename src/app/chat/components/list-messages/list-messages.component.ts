import { Component, ElementRef, Input, OnChanges, OnInit, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { MessageResponse } from '../../models/responses/message.response';

@Component({
  selector: 'app-list-messages',
  templateUrl: './list-messages.component.html',
  styleUrls: ['./list-messages.component.css']
})
export class ListMessagesComponent implements OnInit, OnChanges {

  public showUserImage: boolean;

  @Input() messages: MessageResponse[];

  @ViewChildren('messagesContainer') messagesContainer: QueryList<ElementRef>;

  ngOnInit(): void {
    this.showUserImage = true;
  }

  ngOnChanges(changes: any): void {
    setTimeout(() => {
      this.scrollMessagesToBottom();
    }, 200);
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
