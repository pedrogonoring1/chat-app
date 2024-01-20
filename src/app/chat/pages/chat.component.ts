import { Component, OnInit } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { MessageRequest } from '../models/requests/message.request';
import { MessageResponse } from '../models/responses/message.response';
import { LocalStorageService } from '../../shared/services/local-storage.service';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer } from '@angular/platform-browser';
import { UserOnlineResponse } from '../models/responses/user-online.response';
import { CriptografyService } from 'src/app/shared/services/criptografy.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  public messages: MessageResponse[];
  public nomeUser: string;
  public urlImage: string;
  private socket: WebSocketSubject<any>;
  private countEnvio: number;
  public disabledSendMessage: boolean = false;
  public usersOnlineResponse: UserOnlineResponse[];
  private readonly nameSistem: string = 'SISTEMA 🤖';
  private readonly urlImageSistem: string = 'https://i.pinimg.com/originals/2d/cc/93/2dcc9384250518a03fc038c363b689b8.gif';

  constructor(
    private readonly localStorageService: LocalStorageService,
    private readonly notification: ToastrService,
    private readonly sanitizer: DomSanitizer,
    private readonly criptografyService: CriptografyService,
  ) {
    this.setupVisibilityChange();
  }

  ngOnInit(): void {
    this.countEnvio = 0;
    this.recuperarDadosUserLogado();
    this.usersOnlineResponse = [this.userInitial()];
    this.messages = [this.messageInitial()];

    this.socket = new WebSocketSubject('wss://websocket-chatzin.glitch.me/');
    this.instanciarSocket();
    this.avisarNovoIntegrante();
  }

  private instanciarSocket(): void {
    this.socket.subscribe(
      (message) => {
          try {
            let messagesRecebidas: MessageResponse = JSON.parse(message);

            let userOnline = new UserOnlineResponse({nome: messagesRecebidas.NomeUser, urlImage: messagesRecebidas.UrlImage, class: messagesRecebidas.Class});

            if(messagesRecebidas.Type === 'getUser') {
              this.verificarSeEhNovoUsuario(userOnline);
            }
            if(messagesRecebidas.Type === 'setUserInativo') {
              this.editarUser(userOnline);
            }
            else {
              this.sanitizer.bypassSecurityTrustHtml(messagesRecebidas.Content);
              messagesRecebidas.Content = this.criptografyService.descriptografarContent(messagesRecebidas.Content);
              this.messages = [...this.messages, messagesRecebidas];
              this.verificarSeEhNovoUsuario(userOnline);
              this.countEnvio = 0;
              this.disabledSendMessage = false;
            }
          } catch (error) {
            console.error('Erro ao analisar JSON:', error, message);
          }
      },
      () => this.avisarQuedaWebsocket()
    );
  }

  private messageInitial(): MessageRequest {
    let content = 'As mensagens são temporárias, não ficam salvas em banco de dados e são <b>criptografadas</b> de ponta a ponta.';
    let messageInitial = this.createMessage(content, this.nameSistem, 'sistema', this.urlImageSistem, 'chat', 'img-user-active');
    messageInitial.Content = this.criptografyService.descriptografarContent(messageInitial.Content);
    return messageInitial;
  }

  private userInitial(): UserOnlineResponse {
    return new UserOnlineResponse({nome: this.nomeUser, urlImage: this.urlImage, class: 'img-user-active'});
  }

  private verificarSeEhNovoUsuario(userMessage: UserOnlineResponse): void {
    const usuarioExistente = this.usersOnlineResponse.find(user => user.nome === userMessage.nome);

    if (!usuarioExistente && userMessage.nome !== this.nameSistem) {
      this.usersOnlineResponse.push(userMessage);
    }
  }

  private editarUser(userMessage: UserOnlineResponse): void {
    const index = this.usersOnlineResponse.findIndex(existingUser => existingUser.nome === userMessage.nome);

    if (index !== -1) { // Edita o usuário existente
      this.usersOnlineResponse[index] = new UserOnlineResponse({nome: userMessage.nome, urlImage: userMessage.urlImage, class: userMessage.class});
    }
  }

  private setupVisibilityChange(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // A página está oculta (usuário não ativo)
        this.avisarUserInativo();
      } else {
        this.avisarUserVoltou();
        // A página está visível (usuário ativo)
      }
    });
  }

  private recuperarDadosUserLogado(): void {
    this.nomeUser = this.localStorageService.getItem('User');
    this.urlImage = this.localStorageService.getItem('UrlImage');
  }

  public sendMessage(content: string): void {
    if(this.bypassSendMessage(content))
      return;

    let newMessage = this.createMessage(content, this.nomeUser, 'receptor', this.urlImage, 'chat', 'img-user-active');

    this.socket.next(JSON.stringify(newMessage));

    newMessage.Owner = 'remetente';
    newMessage.Content = content;
    this.messages = [...this.messages, newMessage];
    this.countEnvio++;
  }

  private bypassSendMessage(content: string): boolean {
    let spam: boolean = false;
    let contentNull: boolean = false;
    let isNotSefe: boolean = false;

    if(this.verifySpam())
      spam = true;

    if(content == '' || content == null)
      contentNull = true;

    if(this.isSafeHtml(content))
      isNotSefe = true;

    return spam || contentNull || isNotSefe;
  }

  private verifySpam(): boolean {
    if(this.countEnvio > 10) {
      this.notification.warning('Não é permitido floodar, aguarde um instante.', 'Calma Calabreso!');
      this.disabledSendMessage = true;
      return true;
    }
    return false;
  }

  private isSafeHtml(html: string): boolean {
    if(html.includes("<script>")) {
      this.notification.warning('Não é permitido scripts', 'Calma Calabreso!');
      return true;
    }
    return false;
  }

  private createMessage(content: string, nomeUser: string, owner: string, urlImage: string, type: string, classes: string): MessageRequest {
    return new MessageRequest({
      NomeUser: nomeUser,
      Horario: this.obterHoraAtual(),
      Content: this.criptografyService.criptografarContent(content),
      Owner: owner,
      UrlImage: urlImage,
      Type: type,
      Class: classes
    });
  }

  private obterHoraAtual(): string {
    const agora = new Date();
    const horas = agora.getHours().toString().padStart(2, '0'); // Obtém as horas e adiciona um zero à esquerda, se necessário
    const minutos = agora.getMinutes().toString().padStart(2, '0'); // Obtém os minutos e adiciona um zero à esquerda, se necessário
    return `${horas}:${minutos}`;
  }

  private avisarUserInativo(): void {
    let informarUserInativo = this.createMessage('', this.nomeUser, '', this.urlImage, 'setUserInativo', 'img-user-off');
    this.socket.next(JSON.stringify(informarUserInativo));
  }

  private avisarUserVoltou(): void {
    let informarUserInativo = this.createMessage('', this.nomeUser, '', this.urlImage, 'setUserInativo', 'img-user-active');
    this.socket.next(JSON.stringify(informarUserInativo));
  }

  private avisarNovoIntegrante(): void {
    let textBoasVindas = `<b>${this.nomeUser}</b> entrou na conversa! 👋`;
    let boasVindas = this.createMessage(textBoasVindas, this.nameSistem, 'sistema', this.urlImageSistem, 'chat', 'img-user-active');
    this.socket.next(JSON.stringify(boasVindas));

    boasVindas.Owner = 'sistema';
    boasVindas.Content = textBoasVindas;
    this.messages = [...this.messages, boasVindas];

    let informarUserNew = this.createMessage('', this.nomeUser, '', this.urlImage, 'getUser', 'img-user-active');
    this.socket.next(JSON.stringify(informarUserNew));

    this.avisarUserVoltou();
  }

  private avisarQuedaWebsocket(): void {
    let mensagemInstabilidade = `Houve uma instabilidade e a conexão caiu. Atualize a página para voltar a conversar.`;
    let messageSystemDown = this.createMessage(mensagemInstabilidade, this.nameSistem, 'sistema', this.urlImageSistem, 'chat', '');
    this.socket.next(JSON.stringify(messageSystemDown));

    messageSystemDown.Owner = 'sistema';
    messageSystemDown.Content = mensagemInstabilidade;
    this.messages = [...this.messages, messageSystemDown];
  }
  //<h2>Confira as regras para os blocos do carnaval de rua na Grande Vitória:</h2> <br> <img src="https://classic.exame.com/wp-content/uploads/2021/01/carnaval-20202-rio-divulgacao-riotur.jpg?quality=70&strip=info&w=960" class="img-fluid"> <br><br>  <p>Com o carnaval se aproximando, as prefeituras da Grande Vitória se organizam para receber milhares de foliões nos blocos de rua. Horários para começo e fim do bloco, percurso definido, controle da poluição sonora, além de proibições como a realização de queima de fogos estão entre as regras divulgadas... </p> Acesse a notícia completa: <a href="https://g1.globo.com/es/espirito-santo/carnaval/2024/noticia/2024/01/11/confira-as-regras-para-os-blocos-do-carnaval-de-rua-na-grande-vitoria.ghtml" target="_blank">G1 Vilha Velha</a>
}
