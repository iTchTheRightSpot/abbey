import * as u from '@utils/index';
import * as e from '@entry/index';
import * as c from '@core/index';

export interface IRelationshipStore {
  save(o: c.RelationshipEntity): Promise<c.RelationshipEntity>;
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
}
