import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { catchError, delay, map, merge, Observable, of, startWith } from 'rxjs';
import { LoginModel, RegisterModel } from '@auth/auth.model';
import { ApiResponse, ApiState, err } from '@root/app.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly login = (obj: LoginModel) =>
    environment.production
      ? this.http
          .post<any>(`${environment.domain}auth/login`, obj, {
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
          >(`${environment.domain}logout`, {}, { withCredentials: true })
          .pipe(
            map(() => <ApiResponse<any>>{ state: ApiState.LOADED }),
            startWith(<ApiResponse<any>>{ state: ApiState.LOADING }),
            catchError(e => of(err<any>(e)))
          )
      : merge(
          of<ApiResponse<any>>({ state: ApiState.LOADING }),
          of<ApiResponse<any>>({ state: ApiState.LOADED }).pipe(delay(2000))
        );
}
