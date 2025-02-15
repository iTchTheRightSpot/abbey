import { HttpException } from './http.exception';

export class UnauthorizedException extends HttpException {
  constructor(
    message: string = 'full authentication is required to access this resource'
  ) {
    super(message, 401);
  }
}
