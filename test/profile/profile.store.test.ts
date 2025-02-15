import { Pool, PoolClient } from 'pg';
import { poolInstance } from '@mock/pool';
import { MockLiveDatabaseClient } from '@mock/db-client';
import * as c from '@core/index';
import * as u from '@utils/index';
import { v4 as uuid } from 'uuid';

describe('profile store', () => {
  let pool: Pool;
  let client: PoolClient;
  let store: c.IProfileStore;

  beforeAll(async () => {
    const logger = new u.DevelopmentLogger();
    pool = poolInstance(logger);
    client = await pool.connect();
    store = new c.ProfileStore(logger, new MockLiveDatabaseClient(client));
  });

  beforeEach(async () => await client.query('BEGIN'));

  afterEach(async () => await client.query('ROLLBACK'));

  afterAll(async () => {
    client.release();
    await pool.end();
  });

  const dummy = {
    name: 'firstname',
    dob: 'lastname',
    email: 'assessment@email.com',
    uuid: uuid(),
    password: 'password'
  } as c.ProfileEntity;

  it('should save to profile, role & permission tables', async () =>
    expect((await store.save(dummy)).profile_id).toBeGreaterThan(0));

  it('should retrieve profile by email', async () => {
    // given
    const saved = await store.save(dummy);

    // method to test
    const find = await store.profileByEmail(saved.email);

    // assert
    expect(find).toBeDefined();
    expect(find).toEqual(saved);
  });
});
