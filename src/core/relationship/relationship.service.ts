import * as c from '@core/index';
import * as u from '@utils/index';
import * as e from '@entry/index';

export interface IRelationshipService {
  follow(f: c.FollowPayload): Promise<void>;
}

export class RelationshipService implements IRelationshipService {
  constructor(
    private readonly logger: u.ILogger,
    private readonly adps: e.Adapters
  ) {}

  async follow(o: c.FollowPayload): Promise<void> {
    return Promise.resolve();
  }
}
