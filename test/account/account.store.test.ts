import { Pool, PoolClient } from 'pg';
import { poolInstance } from '@mock/pool';
import { MockLiveDatabaseClient } from '@mock/db-client';
import * as c from '@core/index';
import * as u from '@utils/index';
import { v4 as uuid } from 'uuid';

describe('account store', () => {
  let pool: Pool;
  let client: PoolClient;
  let store: c.IAccountStore;
  const logger = new u.DevelopmentLogger();

  beforeAll(async () => {
    pool = poolInstance(logger);
    client = await pool.connect();
    store = new c.AccountStore(logger, new MockLiveDatabaseClient(client));
  });

  beforeEach(async () => await client.query('BEGIN'));

  afterEach(async () => await client.query('ROLLBACK'));

  afterAll(async () => {
    client.release();
    await pool.end();
  });

  const dummy = {
    name: 'developer challenge',
    dob: '01/01/0',
    email: 'iTchTheRightSpot@email.com',
    uuid: uuid(),
    password: 'password'
  } as c.AccountEntity;

  it('should save to account, role & permission tables', async () =>
    expect((await store.save(dummy)).account_id).toBeGreaterThan(0));

  it('should retrieve account by email', async () => {
    // given
    const saved = await store.save(dummy);

    // method to test
    const find = await store.accountByEmail(saved.email);

    // assert
    expect(find).toBeDefined();
    expect(find).toEqual(saved);
  });
});
