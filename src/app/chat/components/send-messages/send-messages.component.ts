import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MESSAGE_FORM_CONFIG } from '../../config/user.config';
import { AudioService } from '../audio-stream/services/audio.service';

@Component({
  selector: 'app-send-messages',
  templateUrl: './send-messages.component.html',
  styleUrls: ['./send-messages.component.css']
})
export class SendMessagesComponent implements OnInit {

  public messageForm: FormGroup;

  private microfoneAtivo: boolean;
  public iconMicro: string;

  @Input() disabledSendMessage: boolean

  @Output() onSendMessage: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly audioService: AudioService
  )
  {}

  ngOnInit(): void {
    this.builderForm();
    this.startListening();
    this.microfoneAtivo = false;
    this.iconMicro = "bi bi-mic-mute";
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

  public startTalking() {
    if(this.microfoneAtivo == false) {
      this.audioService.startRecording();
      this.iconMicro = "bi bi-mic"
      this.microfoneAtivo = true;
    }
    else {
      this.audioService.stopRecording();
      this.iconMicro = "bi bi-mic-mute"
      this.microfoneAtivo = false;
    }

  }

  public startListening() {
    this.audioService.listenToAudio();
  }

}
