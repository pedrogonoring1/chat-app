import { Component, ElementRef, OnInit, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { MessageRequest } from './models/requests/message.request';
import { MessageResponse } from './models/responses/message.response';
import { LocalStorageService } from '../shared/services/local-storage.service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MESSAGE_FORM_CONFIG } from './config/user.config';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { enc, AES } from 'crypto-js';
import { environment } from '../environments/environment';
import { UserOnlineResponse } from './models/responses/user-online.response';

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
  public usersOnlineResponse: UserOnlineResponse[];

  private readonly CHAVE = environment.chaveCript;

  constructor(
    private localStorageService: LocalStorageService,
    private readonly notification: ToastrService,
    private readonly formBuilder: FormBuilder,
    private readonly sanitizer: DomSanitizer,
    private renderer: Renderer2,
    private el: ElementRef
  ) {
    this.setupVisibilityChange();
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
    this.usersOnlineResponse = [new UserOnlineResponse({nome: this.nomeUser, urlImage: this.urlImage, class: 'img-user-active'})];
    this.textExpandir = 'Expandir'
    this.exibirExpandir = true;
    this.messages = [new MessageResponse({
      Content: 'As mensagens são temporárias e não persistem em nenhum banco de dados. As mensagens são <b>criptografados</b> de ponta a ponta. 😉',
      Horario: this.obterHoraAtual(),
      NomeUser: 'Sistema',
      Owner: 'sistema',
      UrlImage: 'https://i.pinimg.com/originals/2d/cc/93/2dcc9384250518a03fc038c363b689b8.gif',
    }),];

    this.socket = new WebSocketSubject('wss://websocket-chatzin.glitch.me/');

    this.socket.subscribe(
      (message) => {
          try {
            let messagesRecebidas: MessageResponse = JSON.parse(message);

            if(messagesRecebidas.Type === 'getUser') {
              this.verificarSeEhNovoUsuario(new UserOnlineResponse({nome: messagesRecebidas.NomeUser, urlImage: messagesRecebidas.UrlImage, class: messagesRecebidas.Class}));
            }
            if(messagesRecebidas.Type === 'setUserInativo') {
              this.editarUser(new UserOnlineResponse({nome: messagesRecebidas.NomeUser, urlImage: messagesRecebidas.UrlImage, class: messagesRecebidas.Class}));
            }
            else {
              this.sanitizer.bypassSecurityTrustHtml(messagesRecebidas.Content);
              messagesRecebidas.Content = this.descriptografarContent(messagesRecebidas.Content);
              this.messages.push(messagesRecebidas);
              this.verificarSeEhNovoUsuario(new UserOnlineResponse({nome: messagesRecebidas.NomeUser, urlImage: messagesRecebidas.UrlImage, class: messagesRecebidas.Class}));
              this.countEnvio = 0;
              this.disabledSendMessage = false;
            }

          } catch (error) {
            console.error('Erro ao analisar JSON:', error, message);
          }
      },
      (err) => this.avisarQuedaWebsocket(),
      () => this.avisarQuedaWebsocket()
    );

    this.avisarNovoIntegrante();
  }

  private verificarSeEhNovoUsuario(userMessage: UserOnlineResponse) {
    const usuarioExistente = this.usersOnlineResponse.find(user => user.nome === userMessage.nome);

    if (!usuarioExistente && userMessage.nome !== 'Sistema') {
      this.usersOnlineResponse.push(userMessage);
    }
  }

  private editarUser(userMessage: UserOnlineResponse) {
    const index = this.usersOnlineResponse.findIndex(existingUser => existingUser.nome === userMessage.nome);

    if (index !== -1) {
      // Edita o usuário existente
      this.usersOnlineResponse[index] = new UserOnlineResponse({nome: userMessage.nome, urlImage: userMessage.urlImage, class: userMessage.class});
      // console.log(this.usersOnlineResponse[index])
      // Ou você pode fazer a edição direta, por exemplo: this.users[index].urlImage = user.urlImage;
    }
  }

  private setupVisibilityChange(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // A página está oculta (usuário não ativo)
        //console.log('saiu da pagina');
        this.avisarUserInativo();
      } else {
        this.avisarUserVoltou();
        // A página está visível (usuário ativo)
        // this.editarUser(new UserOnlineResponse({nome: this.nomeUser, urlImage: this.urlImage, class: 'img-user-active'}))
      }
    });
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
    newMessage.Owner = 'remetente';
    newMessage.Content = textMessage;

    this.messages.push(newMessage);
    this.scrollMessagesToBottom();
    this.countEnvio++;
    this.messageForm.reset();
  }

  private isSafeHtml(html: string): boolean {
    if(html.includes("<script>")) {
      this.notification.warning('Não é permitido scripts', 'Calma Calabreso!');
      return true;
    }

    return false;
  }

  private avisarUserInativo() {
    let informarUserInativo = new MessageRequest({
      NomeUser: this.nomeUser,
      Horario: this.obterHoraAtual(),
      UrlImage: this.urlImage,
      Type: 'setUserInativo',
      Class: 'img-user-off'
    });

    this.socket.next(JSON.stringify(informarUserInativo));
  }

  private avisarUserVoltou() {
    let informarUserInativo = new MessageRequest({
      NomeUser: this.nomeUser,
      Horario: this.obterHoraAtual(),
      UrlImage: this.urlImage,
      Type: 'setUserInativo',
      Class: 'img-user-active'
    });

    this.socket.next(JSON.stringify(informarUserInativo));
  }

  private avisarNovoIntegrante() {
    let textBoasVindas = `${this.nomeUser} acabou de entrar na conversa! 👋`;
    let boasVindas = new MessageRequest({
      NomeUser: 'Sistema',
      Horario: this.obterHoraAtual(),
      Content: this.criptografarContent(textBoasVindas),
      Owner: 'sistema',
      UrlImage: 'https://i.pinimg.com/originals/2d/cc/93/2dcc9384250518a03fc038c363b689b8.gif',
      Type: 'chat',
      Class: 'img-user-active'
    });

    this.socket.next(JSON.stringify(boasVindas));
    boasVindas.Owner = 'sistema';
    boasVindas.Content = textBoasVindas;
    this.messages.push(boasVindas);

    let informarUserNew = new MessageRequest({
      NomeUser: this.nomeUser,
      Horario: this.obterHoraAtual(),
      UrlImage: this.urlImage,
      Type: 'getUser',
      Class: 'img-user-active'
    });

    this.socket.next(JSON.stringify(informarUserNew));

    this.scrollMessagesToBottom();

    this.avisarUserVoltou();
  }

  private avisarQuedaWebsocket() {
    let mensagemInstabilidade = `Houve uma instabilidade e a conexão caiu. Atualize a página para voltar a conversar.`;
    let boasVindas = new MessageRequest({
      NomeUser: 'Sistema',
      Horario: this.obterHoraAtual(),
      Content: this.criptografarContent(mensagemInstabilidade),
      Owner: 'sistema',
      UrlImage: 'https://i.pinimg.com/originals/2d/cc/93/2dcc9384250518a03fc038c363b689b8.gif',
      Type: 'chat'
    });

    this.socket.next(JSON.stringify(boasVindas));
    boasVindas.Owner = 'sistema';
    boasVindas.Content = mensagemInstabilidade;

    this.messages.push(boasVindas);
    this.scrollMessagesToBottom();
  }

  private createMessage(content: string): MessageRequest {
    return new MessageRequest({
      NomeUser: this.nomeUser,
      Horario: this.obterHoraAtual(),
      Content: this.criptografarContent(content),
      Owner: 'receptor',
      UrlImage: this.urlImage,
      Type: 'chat',
      Class: 'img-user-active'
    });
  }

  public criptografarContent(content: string): string {
    const chaveCriptografia = this.CHAVE;
    const numeroCriptografado = AES.encrypt(content, chaveCriptografia).toString();
    const hashCriptografado = encodeURIComponent(numeroCriptografado);
    return hashCriptografado;
  }

  public descriptografarContent(contentCriptografado: string): string {
    const chaveCriptografia = this.CHAVE;
    const bytesDescriptografados = AES.decrypt(decodeURIComponent(contentCriptografado), chaveCriptografia);
    const textDescriptografado = bytesDescriptografados.toString(enc.Utf8);
    return textDescriptografado;
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
    if (this.messagesContainer?.length > 0) {
      const messagesContainerElement = this.messagesContainer.first.nativeElement;
      messagesContainerElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }

}
