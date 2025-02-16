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
  followers(userUUID: string): Promise<c.AccountEntity[]>;
  followings(userUUID: string): Promise<c.AccountEntity[]>;
  friends(userUUID: string): Promise<c.AccountEntity[]>;
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

  followers(userUUID: string): Promise<c.AccountEntity[]> {
    const q = `
        WITH followers(id) AS (
            SELECT r.account_id FROM relationship r
            INNER JOIN account a ON a.account_id = r.following_id
            WHERE a.uuid = $1
        )
        SELECT a.* FROM followers f
        INNER JOIN account a ON a.account_id = f.id
    `;
    return new Promise<c.AccountEntity[]>(async (resolve, reject) => {
      try {
        const db = await this.db.exec(q.trim(), userUUID.trim());
        if (db.rows.length === 0) return resolve([]);
        const rows = db.rows as c.AccountEntity[];
        rows.forEach((a) => (a.account_id = Number(a.account_id)));
        resolve(rows);
      } catch (e) {
        this.logger.error('error retrieving followers', e);
        reject(e);
      }
    });
  }

  followings(userUUID: string): Promise<any> {
    const q = `
    WITH followering(id) AS (
        SELECT r.following_id FROM relationship r
        INNER JOIN account a ON a.account_id = r.account_id
        WHERE a.uuid = $1
    )
    SELECT a.* FROM followering f
    INNER JOIN account a ON a.account_id = f.id
    `;
    return new Promise<c.AccountEntity[]>(async (resolve, reject) => {
      try {
        const db = await this.db.exec(q.trim(), userUUID.trim());
        if (db.rows.length === 0) return resolve([]);
        const rows = db.rows as c.AccountEntity[];
        rows.forEach((a) => (a.account_id = Number(a.account_id)));
        resolve(rows);
      } catch (e) {
        this.logger.error('error retrieving followings', e);
        reject(e);
      }
    });
  }

  friends(userUUID: string): Promise<any> {
    const q = `
    WITH followering(id) AS (
        SELECT r.following_id FROM relationship r
        INNER JOIN account a ON a.account_id = r.account_id
        WHERE a.uuid = $1 AND r.status = $2
    )
    SELECT a.* FROM followering f
    INNER JOIN account a ON a.account_id = f.id
    `;
    return new Promise<c.AccountEntity[]>(async (resolve, reject) => {
      try {
        const db = await this.db.exec(
          q.trim(),
          userUUID.trim(),
          c.RelationshipStatus.FRIEND
        );
        if (db.rows.length === 0) return resolve([]);
        const rows = db.rows as c.AccountEntity[];
        rows.forEach((a) => (a.account_id = Number(a.account_id)));
        resolve(rows);
      } catch (e) {
        this.logger.error('error retrieving friends', e);
        reject(e);
      }
    });
  }
}
