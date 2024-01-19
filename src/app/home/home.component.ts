import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { USER_FORM_CONFIG } from './config/user.config';
import { UserRequest } from './models/requests/user.request';
import { LocalStorageService } from '../shared/services/local-storage.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public userForm: FormGroup;
  public userRequest: UserRequest;

  constructor(
    private readonly formBuilder: FormBuilder,
    private localStorageService: LocalStorageService,
    private router: Router,
    private readonly notification: ToastrService,
    ) {
  }

  ngOnInit(): void {
    this.builderForm();
  }

  private builderForm(): void {
    this.userForm = this.formBuilder.group(USER_FORM_CONFIG);
  }

  public acessar() {
    this.localStorageService.setItem('User', this.userForm.value.Name);
    this.localStorageService.setItem('UrlImage', this.validarUrlImage(this.userForm.value.UrlImage));
    this.notification.success('Seja bem-vindo(a)', this.userForm.value.Name);
    this.router.navigate(['/chat/messages']);
  }

  private validarUrlImage(urlImage: string): string {
    const urlRegex = /^https:\/\/.*/;

    if(urlImage === null || !urlRegex.test(urlImage))
      return 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
    else
      return this.userForm.value.UrlImage;
  }

}
