import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { catchError, delay, merge, Observable, of, startWith } from 'rxjs';
import { LoginModel } from '@auth/auth.model';
import { ApiResponse, ApiState, err } from '@root/app.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly login = (obj: LoginModel): Observable<ApiResponse<any>> =>
    environment.production
      ? this.http
          .post<any>(`${environment.domain}account/login`, obj, {
            withCredentials: true
          })
          .pipe(
            startWith({ state: ApiState.LOADING } as ApiResponse<any>),
            catchError(e => of(err<any>(e)))
          )
      : merge(
          of({ state: ApiState.LOADING }),
          of({ state: ApiState.LOADED }).pipe(delay(2000))
        );
}
