import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ChatComponent } from "./pages/chat.component";
import { ExpandImageDirective } from "./expand-image.directive";
import { ScrollBottomDirective } from "./scroll-bottom.directive";
import { ListMessagesComponent } from './components/list-messages/list-messages.component';
import { MessageBodyComponent } from './components/message-body/message-body.component';
import { HeaderChatComponent } from './components/header-chat/header-chat.component';
import { SendMessagesComponent } from './components/send-messages/send-messages.component';
import { ListUsersStatusComponent } from './components/list-users-status/list-users-status.component';
import { AudioStreamComponent } from "./components/audio-stream/audio-stream.component";

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [],
  declarations: [
    ChatComponent,
    ScrollBottomDirective,
    ExpandImageDirective,
    ListMessagesComponent,
    MessageBodyComponent,
    HeaderChatComponent,
    AudioStreamComponent,
    SendMessagesComponent,
    ListUsersStatusComponent,
  ],
})
export class ChatModule {}
