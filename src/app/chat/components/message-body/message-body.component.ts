import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MessageResponse } from '../../models/responses/message.response';

@Component({
  selector: 'app-message-body',
  templateUrl: './message-body.component.html',
  styleUrls: ['./message-body.component.css']
})
export class MessageBodyComponent {

  @Input() message: MessageResponse;

  @Output() onExpandImage: EventEmitter<void> = new EventEmitter();

  public emitExpandImage(): void {
    this.onExpandImage.emit();
  }

}
