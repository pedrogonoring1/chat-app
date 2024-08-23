import { Component } from '@angular/core';
import { AudioService } from './services/audio.service';

@Component({
  selector: 'app-audio-stream',
  templateUrl: './audio-stream.component.html',
  styleUrls: ['./audio-stream.component.css'],
})
export class AudioStreamComponent {

  constructor(
    private readonly audioService: AudioService)
 {}

  public startTalking() {
    this.audioService.startRecording();
  }

  public startListening() {
    this.audioService.listenToAudio();
  }
}
