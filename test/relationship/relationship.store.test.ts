import { Pool, PoolClient } from 'pg';
import { poolInstance } from '@mock/pool';
import { MockLiveDatabaseClient } from '@mock/db-client';
import * as c from '@core/index';
import * as u from '@utils/index';
import { v4 as uuid } from 'uuid';

describe('relationship store', () => {
  let pool: Pool;
  let client: PoolClient;
  let accStore: c.IAccountStore;
  let relStore: c.IRelationshipStore;
  const logger = new u.DevelopmentLogger();
  let acc1: c.AccountEntity;
  let acc2: c.AccountEntity;

  beforeAll(async () => {
    pool = poolInstance(logger);
    client = await pool.connect();
    const db = new MockLiveDatabaseClient(client);
    accStore = new c.AccountStore(logger, db);
    relStore = new c.RelationShipStore(logger, db);
  });

  beforeEach(async () => {
    await client.query('BEGIN');
    acc1 = await accStore.save({
      name: 'one',
      dob: '01/01/0',
      email: 'one@email.com',
      uuid: uuid(),
      password: 'password'
    } as c.AccountEntity);

    acc2 = await accStore.save({
      name: 'two',
      dob: '01/01/2',
      email: 'two@email.com',
      uuid: uuid(),
      password: 'password'
    } as c.AccountEntity);
  });

  afterEach(async () => await client.query('ROLLBACK'));

  afterAll(async () => {
    client.release();
    await pool.end();
  });

  describe('save relationship', () => {
    it('success', async () =>
      await relStore.save(<c.RelationshipEntity>{
        status: c.RelationshipStatus.FRIEND,
        relation_id: acc1.account_id,
        following_id: acc2.account_id
      }));

    it('fail. user attempting to follow themselves', async () =>
      await relStore.save(<c.RelationshipEntity>{
        status: c.RelationshipStatus.FRIEND,
        relation_id: acc1.account_id,
        following_id: acc1.account_id
      }));
  });
});
