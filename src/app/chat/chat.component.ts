import { Component, ElementRef, OnInit, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { MessageRequest } from './models/requests/message.request';
import { MessageResponse } from './models/responses/message.response';
import { LocalStorageService } from '../shared/services/local-storage.service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MESSAGE_FORM_CONFIG } from './config/user.config';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit  {

  messages: MessageResponse[];
  nomeUser: string = ''
  urlImage: string = '';
  socket: WebSocketSubject<any>;
  textExpandir: string;
  exibirExpandir: boolean;
  countEnvio: number = 0;
  disabledSendMessage: boolean = false;
  public messageForm: FormGroup;
  private htmlContent: SafeHtml | null;

  constructor(
    private localStorageService: LocalStorageService,
    private readonly notification: ToastrService,
    private readonly formBuilder: FormBuilder,
    private readonly sanitizer: DomSanitizer,
    private renderer: Renderer2,
    private el: ElementRef
  ) {

  }

  private builderForm(): void {
    this.messageForm = this.formBuilder.group(MESSAGE_FORM_CONFIG);
  }

  @ViewChildren('messagesContainer') messagesContainer: QueryList<ElementRef>;

  ngAfterViewChecked() {
    this.scrollMessagesToBottom();
  }

  ngOnInit(): void {

    this.builderForm();
    this.recuperarDadosUserLogado();
    this.textExpandir = 'Expandir'
    this.exibirExpandir = true;
    this.messages = [new MessageResponse({
      Content: 'As mensagens são temporárias e não persistem ao longo do tempo. Em outras palavras, as mensagens são específicas da sessão e apenas os usuários ativos no momento exato do envio as receberão. 😉',
      Horario: this.obterHoraAtual(),
      NomeUser: 'Sistema',
      Owner: false,
      UrlImage: 'https://i.pinimg.com/originals/2d/cc/93/2dcc9384250518a03fc038c363b689b8.gif',
    }),];

    this.socket = new WebSocketSubject('wss://websocket-chatzin.glitch.me/');

    this.socket.subscribe(
      (message) => {
          try {
            let messagesRecebidas: MessageResponse = JSON.parse(message);
            this.sanitizer.bypassSecurityTrustHtml(messagesRecebidas.Content);
            this.messages.push(messagesRecebidas);
            this.countEnvio = 0;
            this.disabledSendMessage = false;
          } catch (error) {
            console.error('Erro ao analisar JSON:', error, message);
          }
      },
      (err) => console.error(err),
      () => console.log('WebSocket closed')
    );
  }

  public clicouExpandirImagem() {
    if(this.exibirExpandir)
      this.textExpandir = ''
    else
      this.textExpandir = 'Expandir'

    this.exibirExpandir = !this.exibirExpandir;
  }

  private recuperarDadosUserLogado() {
    this.nomeUser = this.localStorageService.getItem('User');
    this.urlImage = this.localStorageService.getItem('UrlImage');
  }


  sendMessage() {
    if(this.countEnvio > 10) {
      this.notification.warning('Não é permitido floodar, aguarde um instante.', 'Calma Calabreso!');
      this.disabledSendMessage = true;
      return;
    }

    let textMessage = this.messageForm.value.Content;

    if(textMessage == '' || textMessage == null)
      return

    if(this.isSafeHtml(textMessage))
      return;

    let newMessage = this.createMessage(textMessage);
    this.socket.next(JSON.stringify(newMessage));
    newMessage.Owner = true;

    this.messages.push(newMessage);
    this.scrollMessagesToBottom();
    this.countEnvio++;
    this.messageForm.reset();
  }

  private isSafeHtml(html: string): boolean {
    if(html.includes("<script>")) {
      this.htmlContent = this.sanitizer.bypassSecurityTrustHtml(html);
      this.notification.warning('Não é permitido scripts', 'Calma Calabreso!');
      return true;
    }

    return false;
  }

  private createMessage(content: string): MessageRequest {
    return new MessageRequest({
      NomeUser: this.nomeUser,
      Horario: this.obterHoraAtual(),
      Content: content,
      Owner: false,
      UrlImage: this.urlImage
    });
  }

  private obterHoraAtual(): string {
    const agora = new Date();
    const horas = agora.getHours().toString().padStart(2, '0'); // Obtém as horas e adiciona um zero à esquerda, se necessário
    const minutos = agora.getMinutes().toString().padStart(2, '0'); // Obtém os minutos e adiciona um zero à esquerda, se necessário
    return `${horas}:${minutos}`;
  }

  public emDesenvolvimento() {
    this.notification.info("Funcionalidade em desenvolvimento", 'Foi mal...')
  }

  public adicionarImagemChat() {
    this.messageForm.patchValue({
      Content: ['<img src="" class="img-fluid">']
    });
  }

  public adicionarLinkChat() {
    this.messageForm.patchValue({
      Content: ['<a href="" target="_blank">ALTERE AQUI</a>']
    });
  }

  private scrollMessagesToBottom() {
    // Certifique-se de que há mensagens e a referência ao elemento está disponível
    if (this.messagesContainer.length > 0) {
      const messagesContainerElement = this.messagesContainer.first.nativeElement;
      messagesContainerElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }

}
