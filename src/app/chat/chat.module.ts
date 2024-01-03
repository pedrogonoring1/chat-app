import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ChatComponent } from "./chat.component";
import { ExpandImageDirective } from "./expand-image.directive";
import { ScrollBottomDirective } from "./scroll-bottom.directive";

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
  ],
})
export class ChatModule {}