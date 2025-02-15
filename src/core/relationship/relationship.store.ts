import * as u from '@utils/index';
import * as e from '@entry/index';
import * as c from '@core/index';
import db from 'node-pg-migrate/dist/db';

export interface IRelationshipStore {
  save(o: c.RelationshipEntity): Promise<c.RelationshipEntity>;
  relationshipByAccountAndFollowingId(
    user1Id: number,
    user2Id: number
  ): Promise<c.RelationshipEntity | undefined>;
  updateStatus(
    accountId: number,
    followingId: number,
    status: c.RelationshipStatus
  ): Promise<void>;
  delete(accountId: number, followingId: number): Promise<number>;
}

export class RelationShipStore implements IRelationshipStore {
  constructor(
    private readonly logger: u.ILogger,
    private readonly db: e.IDatabaseClient
  ) {}

  save(o: c.RelationshipEntity): Promise<c.RelationshipEntity> {
    const query = `
        INSERT INTO relationship (status, account_id, following_id)
        VALUES ($1, $2, $3)
        RETURNING relation_id;
    `;

    return new Promise<c.RelationshipEntity>(async (resolve, reject) => {
      try {
        const db = await this.db.exec(
          query.trim(),
          o.status,
          o.account_id,
          o.following_id
        );
        o.relation_id = Number(
          (db.rows[0] as c.RelationshipEntity).relation_id
        );
        resolve(o);
        this.logger.log('relationship saved');
      } catch (e) {
        this.logger.error('error saving relationship', e);
        reject(e);
      }
    });
  }

  relationshipByAccountAndFollowingId(
    user1Id: number,
    user2Id: number
  ): Promise<c.RelationshipEntity | undefined> {
    const q = `
      SELECT * FROM relationship
      WHERE account_id = $1 AND following_id = $2
      LIMIT 1;
    `;
    return new Promise<c.RelationshipEntity | undefined>(
      async (resolve, reject) => {
        try {
          const db = await this.db.exec(q.trim(), user1Id, user2Id);
          if (db.rows[0] === undefined || db.rows[0] === null)
            return resolve(undefined);

          const r = db.rows[0] as c.RelationshipEntity;
          r.relation_id = Number(r.relation_id);
          r.account_id = Number(r.account_id);
          r.following_id = Number(r.following_id);

          resolve(r);
        } catch (e) {
          this.logger.error(
            'error retrieving RelationshipEntity with account_id',
            user1Id,
            'and following_id',
            user2Id
          );
          reject(e);
        }
      }
    );
  }

  updateStatus(
    accountId: number,
    followingId: number,
    status: c.RelationshipStatus
  ): Promise<void> {
    const q =
      'UPDATE relationship SET status = $3 WHERE account_id = $1 AND following_id = $2';
    return new Promise<void>(async (resolve, reject) => {
      try {
        const db = await this.db.exec(q.trim(), accountId, followingId, status);
        if (db.rowCount === 0)
          return reject('relationship not updated. invalid accountId');
        resolve();
      } catch (e) {
        this.logger.error('error updating relationship status', e);
        reject(e);
      }
    });
  }

  delete(accountId: number, followingId: number): Promise<number> {
    const q = `
        WITH deleted as (
            DELETE FROM relationship WHERE account_id = $1 AND following_id = $2
            RETURNING account_id
        )
        SELECT COUNT(*) FROM deleted;
    `;
    return new Promise<number>(async (resolve, reject) => {
      try {
        const db = await this.db.exec(q.trim(), accountId, followingId);
        if (db.rows[0] === null || db.rows[0] === undefined)
          return reject('no data deleted');
        resolve(Number(db.rows[0].count));
      } catch (e) {
        this.logger.error('error deleting relationship', e);
        reject(e);
      }
    });
  }
}
