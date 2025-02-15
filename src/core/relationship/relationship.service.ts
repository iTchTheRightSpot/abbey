import * as c from '@core/index';
import * as u from '@utils/index';
import * as e from '@entry/index';
import * as ex from '@exceptions/index';

export interface IRelationshipService {
  follow(j: c.JwtObject, payload: c.FollowPayload): Promise<void>;
}

export class RelationshipService implements IRelationshipService {
  constructor(
    private readonly logger: u.ILogger,
    private readonly adps: e.Adapters
  ) {}

  async follow(j: c.JwtObject, o: c.FollowPayload): Promise<void> {
    if (j.user_id.trim() === o.user_id.trim())
      throw new ex.InsertionException('cannot follow yourself');

    let user: c.AccountEntity;
    let userToFollow: c.AccountEntity;

    try {
      const u = await this.adps.account.accountByUUID(j.user_id);
      const utf = await this.adps.account.accountByUUID(o.user_id.trim());
      if (!u || !utf) return Promise.reject();
      user = u;
      userToFollow = utf;
    } catch (e) {
      throw new ex.NotFoundException('invalid user id');
    }

    try {
      // return error if a user already follows userToFollow
      const userIsFollowing =
        await this.adps.relationship.relationshipByAccountAndFollowingId(
          user.account_id,
          userToFollow.account_id
        );
      if (userIsFollowing)
        return Promise.reject(
          new ex.InsertionException('already following account')
        );

      // perform save
      await this.adps.transaction?.runInTransaction(async (adps) => {
        let status = c.RelationshipStatus.NOT_FRIEND;

        // validate is userToFollow already follows current user.
        const userToFollowIsAlreadyFollowing =
          await adps.relationship.relationshipByAccountAndFollowingId(
            userToFollow.account_id,
            user.account_id
          );

        if (userToFollowIsAlreadyFollowing) {
          status = c.RelationshipStatus.FRIEND;
          await adps.relationship.updateStatus(userToFollow.account_id, status);
        }

        await adps.relationship.save({
          status: status,
          account_id: user.account_id,
          following_id: userToFollow.account_id
        } as c.RelationshipEntity);
      });
    } catch (e) {
      if (e instanceof ex.InsertionException)
        throw new ex.InsertionException(e.message);
      throw new ex.InsertionException(
        `error following user with id ${o.user_id.trim()}`
      );
    }
  }
}
