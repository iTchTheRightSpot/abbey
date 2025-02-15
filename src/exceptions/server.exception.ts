import { HttpException } from './http.exception';

export class ServerException extends HttpException {
  constructor(message: string = 'internal server error') {
    super(message, 500);
  }
}
