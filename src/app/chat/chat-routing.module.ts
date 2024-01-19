import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ChatComponent } from "./pages/chat.component";

const routes: Routes = [
  {
    path: 'chat',
    children: [
      {
        path: 'messages',
        component: ChatComponent
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class ChatRoutingModule {}
