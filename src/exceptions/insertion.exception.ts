import { HttpException } from './http.exception';

export class InsertionException extends HttpException {
  constructor(message: string = 'failed to perform insertion operation') {
    super(message, 409);
  }
}
