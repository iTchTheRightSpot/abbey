import * as argon2 from 'argon2';
import * as u from '@utils/index';
import * as c from '@core/index';
import * as ex from '@exceptions/index';

export class PasswordService implements c.IPasswordService {
  constructor(private readonly logger: u.ILogger) {}

  async encode(password: string): Promise<string> {
    try {
      return await argon2.hash(password);
    } catch (e) {
      this.logger.error(e);
      throw new ex.ServerException('error hashing password. please try again');
    }
  }

  async verify(
    plainTextPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    try {
      if (!(await argon2.verify(hashedPassword, plainTextPassword))) {
        this.logger.error('plain text password does not match hashed password');
        return Promise.reject(false);
      }
      return Promise.resolve(true);
    } catch (e) {
      this.logger.error(e);
      throw new ex.UnauthorizedException('invalid password');
    }
  }
}
