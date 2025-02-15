import * as u from '@utils/index';
import * as e from '@entry/index';
import * as c from '@core/index';
import * as ex from '@exceptions/index';

export interface IAccountService {
  account(obj: c.JwtObject): Promise<{}>;
  update(obj: c.JwtObject, p: c.AccountPayload): Promise<void>;
}

export class AccountService implements IAccountService {
  constructor(
    private readonly logger: u.ILogger,
    private readonly adapters: e.Adapters
  ) {}

  async account(obj: c.JwtObject): Promise<{}> {
    try {
      const p = await this.adapters.account.accountByUUID(obj.user_id.trim());
      if (!p) return Promise.reject(new ex.NotFoundException());

      return { name: p.name, dob: p.dob, email: p.email };
    } catch (e) {
      throw new ex.NotFoundException('account not found');
    }
  }

  async update(obj: c.JwtObject, pay: c.AccountPayload): Promise<void> {
    try {
      const p = await this.adapters.account.accountByUUID(obj.user_id.trim());
      if (!p)
        return Promise.reject(
          new ex.NotFoundException('account not found to update')
        );

      p.dob = pay.dob.trim();
      p.name = pay.name.trim();
      await this.adapters.account.update(p);
    } catch (e) {
      this.logger.error(e);
      if (e instanceof ex.NotFoundException)
        throw new ex.InsertionException(e.message);
      throw new ex.InsertionException('error updating account');
    }
  }
}
