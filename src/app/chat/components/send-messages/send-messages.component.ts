import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MESSAGE_FORM_CONFIG } from '../../config/user.config';

@Component({
  selector: 'app-send-messages',
  templateUrl: './send-messages.component.html',
  styleUrls: ['./send-messages.component.css']
})
export class SendMessagesComponent implements OnInit {

  public messageForm: FormGroup;

  @Input() disabledSendMessage: boolean

  @Output() onSendMessage: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private readonly formBuilder: FormBuilder,
  )
  {}

  ngOnInit(): void {
    this.builderForm();
  }

  private builderForm(): void {
    this.messageForm = this.formBuilder.group(MESSAGE_FORM_CONFIG);
  }

  public emitMessage(): void {
    this.onSendMessage.emit(this.messageForm.value.Content);
    this.messageForm.reset();
  }

  public adicionarImagemChat(): void {
    this.messageForm.patchValue({
      Content: ['<img src="" class="img-fluid">']
    });
  }

  public adicionarLinkChat(): void {
    this.messageForm.patchValue({
      Content: ['<a href="" target="_blank">ALTERE AQUI</a>']
    });
  }

}
