import { Component, Input } from '@angular/core';
import { UserOnlineResponse } from '../../models/responses/user-online.response';

@Component({
  selector: 'app-list-users-status',
  templateUrl: './list-users-status.component.html',
  styleUrls: ['./list-users-status.component.css']
})
export class ListUsersStatusComponent {

  @Input() usersOnlineResponse: UserOnlineResponse[];

}
