// src/app/services/audio.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private socket: Socket;
  private audioContext: AudioContext;
  private processor: ScriptProcessorNode;
  private stream: MediaStream;

  constructor() {
    this.socket = io('wss://websocket-audio.glitch.me/'); // URL do seu servidor Node.js
    this.audioContext = new AudioContext(); // Reutilizando o mesmo AudioContext
  }

  public startRecording() {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        this.stream = stream;
        const input = this.audioContext.createMediaStreamSource(stream);
        this.processor = this.audioContext.createScriptProcessor(512, 1, 1);

        input.connect(this.processor);
        this.processor.connect(this.audioContext.destination);

        this.processor.onaudioprocess = (event) => {
          const audioData = event.inputBuffer.getChannelData(0);
          const arrayBuffer = audioData.buffer; // Obtém o ArrayBuffer subjacente

          if (arrayBuffer.byteLength > 0) {
            this.socket.emit('audio-stream', arrayBuffer);
          }
        };
      })
      .catch((error) => {
        console.error('Erro ao acessar o dispositivo de áudio:', error);
      });
  }

  public listenToAudio() {
    const audioChunks: Float32Array[] = [];

    this.socket.on('audio-stream', (buffer: ArrayBuffer) => {
      const audioData = new Float32Array(buffer);

      if (audioData.length > 0) {
        audioChunks.push(audioData);

        // Tente reproduzir áudio após acumular pacotes suficientes
        if (audioChunks.length > 100) {
          // ajuste o valor conforme necessário
          const combined = new Float32Array(
            audioChunks.reduce((acc, val) => acc + val.length, 0)
          );
          let offset = 0;
          audioChunks.forEach((chunk) => {
            combined.set(chunk, offset);
            offset += chunk.length;
          });

          const audioBuffer = this.audioContext.createBuffer(
            1,
            combined.length,
            this.audioContext.sampleRate
          );
          audioBuffer.copyToChannel(combined, 0);

          const source = this.audioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(this.audioContext.destination);
          source.start();

          audioChunks.length = 0; // Limpa o buffer de pacotes
        }
      } else {
        console.error('Dados de áudio inválidos ou vazios');
      }
    });
  }

  public stopRecording() {
    if (this.processor && this.stream) {
      this.processor.disconnect();
      this.stream.getTracks().forEach(track => track.stop());
      this.socket.emit('stop-stream'); // Envia uma mensagem opcional para o servidor
    }
  }
}
