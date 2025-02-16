import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Message } from 'primeng/message';
import { Button } from 'primeng/button';
import { Password } from 'primeng/password';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { LoginModel } from '@auth/auth.model';
import { ApiResponse, ApiState } from '@root/app.model';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    IconField,
    InputIcon,
    Message,
    Button,
    Password,
    FloatLabel,
    InputText
  ],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  login = input.required<ApiResponse<any>>();
  readonly emit = output<LoginModel>();

  protected readonly state = ApiState;

  protected readonly form = inject(FormBuilder).group({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  protected readonly submit = () =>
    this.form.invalid ? {} : this.emit.emit(this.form.value as LoginModel);
}
