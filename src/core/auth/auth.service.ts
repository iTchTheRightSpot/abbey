import * as u from '@utils/index';
import * as e from '@entry/index';
import * as c from '@core/index';
import * as ex from '@exceptions/index';
import { v4 as uuid } from 'uuid';

export class AuthService implements c.IAuthService {
  constructor(
    private readonly logger: u.ILogger,
    private readonly adapters: e.Adapters,
    private readonly jwtService: c.IJwtService,
    private readonly passwordService: c.IPasswordService
  ) {}

  async register(obj: c.RegisterAccountPayload): Promise<void> {
    const password = await this.passwordService.encode(obj.password);

    try {
      await this.adapters.account.save({
        name: obj.name,
        dob: obj.dob,
        email: obj.email.trim(),
        uuid: uuid(),
        password: password
      } as c.AccountEntity);
    } catch (e) {
      this.logger.error(e);
      throw new ex.InsertionException('error registering account');
    }
  }

  async login(dto: c.LoginPayload): Promise<c.JwtResponse> {
    const obj = await this.adapters.account.accountByEmail(dto.email.trim());

    if (!obj) {
      this.logger.error(`${dto.email.trim()} not found`);
      throw new ex.NotFoundException('no account found.');
    }

    try {
      if (!(await this.passwordService.verify(dto.password, obj.password))) {
        return Promise.reject(
          new ex.UnauthorizedException('invalid email or password')
        );
      }
    } catch (err) {
      this.logger.error(err);
      throw new ex.UnauthorizedException('invalid email or password');
    }

    return this.jwtService.encode(
      { user_id: obj.uuid, name: obj.name },
      u.twoDaysInSeconds
    );
  }
}
