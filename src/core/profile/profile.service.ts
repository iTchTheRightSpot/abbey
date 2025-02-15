import * as u from '@utils/index';
import * as e from '@entry/index';
import * as c from '@core/index';
import * as ex from '@exceptions/index';

export interface IProfileService {
  profile(obj: c.JwtObject): Promise<{}>;
  update(obj: c.JwtObject, p: c.ProfilePayload): Promise<void>;
}

export class ProfileService implements IProfileService {
  constructor(
    private readonly logger: u.ILogger,
    private readonly adapters: e.Adapters
  ) {}

  async profile(obj: c.JwtObject): Promise<{}> {
    try {
      const p = await this.adapters.profileStore.profileByUUID(
        obj.user_id.trim()
      );
      if (!p) return Promise.reject(new ex.NotFoundException());

      return { name: p.name, dob: p.dob, email: p.email };
    } catch (e) {
      throw new ex.NotFoundException('profile not found');
    }
  }

  async update(obj: c.JwtObject, pay: c.ProfilePayload): Promise<void> {
    try {
      const p = await this.adapters.profileStore.profileByUUID(
        obj.user_id.trim()
      );
      if (!p)
        return Promise.reject(
          new ex.NotFoundException('profile not found to update')
        );

      p.dob = pay.dob.trim();
      p.name = pay.name.trim();
      await this.adapters.profileStore.update(p);
    } catch (e) {
      this.logger.error(e);
      if (e instanceof ex.NotFoundException)
        throw new ex.InsertionException(e.message);
      throw new ex.InsertionException('error updating profile');
    }
  }
}
