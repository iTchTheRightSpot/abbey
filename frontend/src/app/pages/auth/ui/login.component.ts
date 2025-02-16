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
  template: `
    <div
      class="w-full md:w-fit h-fit px-10 md:px-20 py-7 flex flex-col item-center justify-center rounded-md border shadow-2xl"
    >
      <div class="text-center md:text-left mb-4">
        <p class="mb-2 text-xl md:text-2xl font-bold">Log in</p>
        <span class="font-medium opacity-50">Please enter your details</span>
      </div>

      <form
        [formGroup]="form"
        class="flex flex-col gap-4 text-center md:text-left"
      >
        <div
          class="w-full flex flex-col md:flex-row items-center justify-center gap-4"
        >
          <div>
            <p-iconfield styleClass="mb-0">
              <p-inputicon styleClass="pi pi-envelope" />
              <input
                type="text"
                formControlName="email"
                pInputText
                placeholder="Email"
              />
            </p-iconfield>
            @if (
              form.controls['email'].invalid &&
              !form.controls['email'].untouched
            ) {
              <p-message severity="error" variant="simple" size="small">
                Email is required
              </p-message>
            }
          </div>

          <div>
            <p-floatlabel variant="on">
              <p-password
                formControlName="password"
                [toggleMask]="true"
                id="on_label"
                inputId="on_label"
              />
              <label for="on_label">Password</label>
            </p-floatlabel>
            @if (
              form.controls['password'].invalid &&
              !form.controls['password'].untouched
            ) {
              <p-message severity="error" variant="simple" size="small">
                Password is required
              </p-message>
            }
          </div>
        </div>

        <p-button
          [disabled]="form.invalid || login().state === state.LOADING"
          (onClick)="submit()"
        >
          @if (login().state === state.LOADING) {
            <i class="pi pi-spin pi-spinner" style="font-size: 1rem"></i>
          } @else {
            Login
          }
        </p-button>
      </form>

      @if (login().state === state.ERROR) {
        <p-message severity="error" variant="simple">
          {{ login().message }}
        </p-message>
      }
    </div>
  `,
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
