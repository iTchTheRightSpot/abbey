import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, switchMap, tap } from 'rxjs';
import { RegisterComponent } from '@auth/ui/register/register.component';
import { LoginComponent } from '@auth/ui/login/login.component';
import { LoginModel, RegisterModel } from '@auth/auth.model';
import { AuthService } from '@shared/data-access/auth.service';
import { ApiResponse, ApiState } from '@shared/model/shared.model';
import { RootRoutes } from '@root/app.routes';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  imports: [
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    LoginComponent,
    RegisterComponent
  ],
  templateUrl: './auth.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthComponent {
  private readonly service = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly loginSubject = new Subject<LoginModel>();
  protected readonly login = toSignal(
    this.loginSubject.asObservable().pipe(
      switchMap(obj => this.service.login(obj)),
      tap(obj => {
        if (obj.state === ApiState.LOADED)
          this.router.navigate([`/${RootRoutes.HOME}`]);
      })
    ),
    { initialValue: <ApiResponse<any>>{ state: ApiState.LOADED } }
  );

  protected readonly registerSubject = new Subject<RegisterModel>();
  protected readonly register = toSignal(
    this.registerSubject
      .asObservable()
      .pipe(switchMap(o => this.service.register(o))),
    { initialValue: <ApiResponse<any>>{ state: ApiState.LOADED } }
  );
}
