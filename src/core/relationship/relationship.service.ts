import * as c from '@core/index';
import * as u from '@utils/index';
import * as e from '@entry/index';
import * as ex from '@exceptions/index';

export interface IRelationshipService {
  following(
    j: c.JwtObject,
    p: c.RelationshipStatusParam
  ): Promise<c.AccountResponse[]>;
  follow(j: c.JwtObject, payload: c.FollowPayload): Promise<void>;
  unfollow(j: c.JwtObject, payload: c.FollowPayload): Promise<void>;
}

export class RelationshipService implements IRelationshipService {
  constructor(
    private readonly logger: u.ILogger,
    private readonly adps: e.Adapters
  ) {}

  async following(
    j: c.JwtObject,
    p: c.RelationshipStatusParam
  ): Promise<c.AccountResponse[]> {
    try {
      switch (p) {
        case c.RelationshipStatusParam.FOLLOWERS:
          return (await this.adps.relationship.followers(j.user_id)).map(
            (a) =>
              <c.AccountResponse>{
                name: a.name,
                dob: a.dob,
                email: a.email,
                user_id: a.uuid
              }
          );
        case c.RelationshipStatusParam.FOLLOWING:
          return (await this.adps.relationship.followings(j.user_id)).map(
            (a) =>
              <c.AccountResponse>{
                name: a.name,
                dob: a.dob,
                email: a.email,
                user_id: a.uuid
              }
          );
        case c.RelationshipStatusParam.FRIENDS:
          return (await this.adps.relationship.friends(j.user_id)).map(
            (a) =>
              <c.AccountResponse>{
                name: a.name,
                dob: a.dob,
                email: a.email,
                user_id: a.uuid
              }
          );
      }
    } catch (e) {
      this.logger.error(e);
      throw new ex.ServerException();
    }
  }

  async follow(j: c.JwtObject, o: c.FollowPayload): Promise<void> {
    if (j.user_id.trim() === o.user_id.trim())
      throw new ex.BadRequestException('cannot follow yourself');

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
      // return error if user already follows userToFollow
      const userIsFollowingUserToFollow =
        await this.adps.relationship.relationshipByAccountAndFollowingId(
          user.account_id,
          userToFollow.account_id
        );
      if (userIsFollowingUserToFollow)
        return Promise.reject(
          new ex.BadRequestException('already following account')
        );

      // perform save
      await this.adps.transaction?.runInTransaction(async (adps) => {
        let status = c.RelationshipStatus.NOT_FRIEND;

        const userToFollowIsFollowingUser =
          await adps.relationship.relationshipByAccountAndFollowingId(
            userToFollow.account_id,
            user.account_id
          );

        // update userToFollow status to FRIEND if he/she already follows current user.
        if (userToFollowIsFollowingUser) {
          status = c.RelationshipStatus.FRIEND;
          await adps.relationship.updateStatus(
            userToFollow.account_id,
            user.account_id,
            status
          );
        }

        await adps.relationship.save({
          status: status,
          account_id: user.account_id,
          following_id: userToFollow.account_id
        } as c.RelationshipEntity);
      });
    } catch (e) {
      if (e instanceof ex.BadRequestException)
        throw new ex.BadRequestException(e.message);
      throw new ex.InsertionException(
        `error following user with id ${o.user_id.trim()}`
      );
    }
  }

  async unfollow(j: c.JwtObject, o: c.FollowPayload): Promise<void> {
    if (j.user_id.trim() === o.user_id.trim())
      throw new ex.BadRequestException('cannot unfollow yourself');

    let user: c.AccountEntity;
    let userToUnFollow: c.AccountEntity;

    try {
      const u = await this.adps.account.accountByUUID(j.user_id);
      const utu = await this.adps.account.accountByUUID(o.user_id.trim());
      if (!u || !utu) return Promise.reject();
      user = u;
      userToUnFollow = utu;
    } catch (e) {
      throw new ex.NotFoundException('invalid user id');
    }

    try {
      const userIsFollowingUserToUnfollow =
        await this.adps.relationship.relationshipByAccountAndFollowingId(
          user.account_id,
          userToUnFollow.account_id
        );

      // inorder to unfollow, validate user indeed follows userToUnfollow
      if (!userIsFollowingUserToUnfollow)
        return Promise.reject(
          new ex.BadRequestException('you are not following account')
        );

      // perform update & deletion
      await this.adps.transaction?.runInTransaction(async (adps) => {
        // validate if userToUnFollow is following current user.
        const userToUnFollowIsFollowingUser =
          await adps.relationship.relationshipByAccountAndFollowingId(
            userToUnFollow.account_id,
            user.account_id
          );

        if (userToUnFollowIsFollowingUser)
          await adps.relationship.updateStatus(
            userToUnFollow.account_id,
            user.account_id,
            c.RelationshipStatus.NOT_FRIEND
          );

        // delete following
        const count = await adps.relationship.delete(
          user.account_id,
          userToUnFollow.account_id
        );
        if (count === 0 || count > 1) {
          this.logger.error(
            'error deleting relationship. number of rows affected',
            count
          );
          return Promise.reject(new ex.InsertionException('error unfollowing'));
        }
      });
    } catch (e) {
      if (e instanceof ex.BadRequestException)
        throw new ex.BadRequestException(e.message);
      throw new ex.InsertionException(
        `error unfollowing user with id ${o.user_id.trim()}`
      );
    }
  }
}
