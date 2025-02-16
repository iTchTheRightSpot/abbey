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
import { FloatLabel } from 'primeng/floatlabel';
import { Button } from 'primeng/button';
import { Password } from 'primeng/password';
import { ApiResponse, ApiState } from '@root/app.model';
import { InputText } from 'primeng/inputtext';
import { RegisterModel } from '@auth/auth.model';
import { DatePicker } from 'primeng/datepicker';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    IconField,
    InputIcon,
    Message,
    FloatLabel,
    Button,
    Password,
    InputText,
    DatePicker
  ],
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  register = input.required<ApiResponse<any>>();
  readonly emit = output<RegisterModel>();

  protected readonly state = ApiState;
  private readonly rx =
    '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$';
  protected readonly form = inject(FormBuilder).group({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(50)
    ]),
    dob: new FormControl<Date | null>(null, [Validators.required]),
    email: new FormControl('', [
      Validators.required,
      Validators.email,
      Validators.maxLength(320)
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(15),
      Validators.pattern(this.rx)
    ]),
    confirm_password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(15),
      Validators.pattern(this.rx)
    ])
  });

  protected readonly match = () =>
    this.form.controls['password'].value ===
    this.form.controls['confirm_password'].value;

  protected readonly submit = () =>
    this.form.invalid
      ? {}
      : this.emit.emit({
          name: this.form.controls['name'].value || '',
          dob: this.form.controls['dob'].value!.toDateString(),
          email: this.form.controls['email'].value || '',
          password: this.form.controls['password'].value || ''
        });
}
