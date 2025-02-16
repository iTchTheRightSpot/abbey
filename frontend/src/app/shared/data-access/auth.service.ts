import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import {
  BehaviorSubject,
  catchError,
  delay,
  map,
  merge,
  of,
  startWith,
  switchMap,
  tap
} from 'rxjs';
import { LoginModel, RegisterModel } from '@auth/auth.model';
import {
  ActiveUser,
  ApiResponse,
  ApiState,
  err
} from '@shared/model/shared.model';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly activeUserCache = new BehaviorSubject<
    ActiveUser | undefined
  >(undefined);

  private readonly activeUserRequest = () =>
    !environment.production
      ? of<ActiveUser>({ user_id: '1', name: 'test user' })
      : this.http
          .get<ActiveUser>(`${environment.domain}auth/active`, {
            withCredentials: true
          })
          .pipe(
            tap(o => {
              if (o && Object.keys(o).length > 0) this.activeUserCache.next(o);
            }),
            startWith(),
            catchError(e => of(e))
          );

  readonly user = toSignal(
    this.activeUserCache
      .asObservable()
      .pipe(switchMap(o => (o ? of<ActiveUser>(o) : this.activeUserRequest()))),
    { initialValue: undefined }
  );

  readonly login = (obj: LoginModel) =>
    environment.production
      ? this.http
          .post<any>(`${environment.domain}auth/login`, obj, {
            withCredentials: true
          })
          .pipe(
            switchMap(() =>
              this.activeUserRequest().pipe(
                map(() => <ApiResponse<any>>{ state: ApiState.LOADED })
              )
            ),
            startWith(<ApiResponse<any>>{ state: ApiState.LOADING }),
            catchError(e => of(err<any>(e)))
          )
      : merge(
          of<ApiResponse<any>>({ state: ApiState.LOADING }),
          of<ApiResponse<any>>({ state: ApiState.LOADED }).pipe(delay(2000))
        );

  readonly register = (obj: RegisterModel) =>
    environment.production
      ? this.http
          .post<any>(`${environment.domain}auth/register`, obj, {
            withCredentials: true
          })
          .pipe(
            map(() => <ApiResponse<any>>{ state: ApiState.LOADED }),
            startWith(<ApiResponse<any>>{ state: ApiState.LOADING }),
            catchError(e => of(err<any>(e)))
          )
      : merge(
          of<ApiResponse<any>>({ state: ApiState.LOADING }),
          of<ApiResponse<any>>({ state: ApiState.LOADED }).pipe(delay(2000))
        );

  readonly logout = () =>
    environment.production
      ? this.http
          .post<
            ApiResponse<any>
          >(`${environment.domain}auth/logout`, {}, { withCredentials: true })
          .pipe(
            tap(() => this.activeUserCache.next(undefined)),
            map(() => <ApiResponse<any>>{ state: ApiState.LOADED }),
            startWith(<ApiResponse<any>>{ state: ApiState.LOADING }),
            catchError(e => of(err<any>(e)))
          )
      : merge(
          of<ApiResponse<any>>({ state: ApiState.LOADING }),
          of<ApiResponse<any>>({ state: ApiState.LOADED }).pipe(delay(2000))
        );
}
