import * as u from '@utils/index';
import * as e from '@entry/index';

export interface IProfileService {}

export class ProfileService implements IProfileService {
  constructor(
    private readonly logger: u.ILogger,
    private readonly adapters: e.Adapters
  ) {}
}
