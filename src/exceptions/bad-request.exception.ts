import { HttpException } from './http.exception';

export class BadRequestException extends HttpException {
  constructor(message: string = 'bad request') {
    super(message, 400);
  }
}
