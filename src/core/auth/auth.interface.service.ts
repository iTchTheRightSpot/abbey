import * as c from '@core/index';

export interface IJwtService {
  encode(obj: c.JwtObject, expirationInSeconds: number): c.JwtResponse;
  decode(token: string): Promise<c.JwtClaimsObject>;
}

export interface IAuthService {
  register(obj: c.RegisterAccountPayload): Promise<void>;
  login(obj: c.LoginPayload): Promise<c.JwtResponse>;
}

export interface IPasswordService {
  encode(password: string): Promise<string>;
  verify(plainTextPassword: string, hashedPassword: string): Promise<boolean>;
}
