import * as u from '@utils/index';
import * as e from '@entry/index';
import * as c from '@core/index';

export interface IProfileService {
  update(p: c.ProfilePayload): Promise<void>;
}

export class ProfileService implements IProfileService {
  constructor(
    private readonly logger: u.ILogger,
    private readonly adapters: e.Adapters
  ) {}

  update(p: c.ProfilePayload): Promise<void> {
    this.logger.log('update profile hit');
    return Promise.resolve();
  }
}
