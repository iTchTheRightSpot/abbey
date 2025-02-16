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
      expect(
        (
          await relStore.save(<c.RelationshipEntity>{
            status: c.RelationshipStatus.FRIEND,
            account_id: acc1.account_id,
            following_id: acc2.account_id
          })
        ).relation_id
      ).toBeGreaterThan(0));

    it('fail. user attempting to follow themselves', async () =>
      await expect(
        relStore.save(<c.RelationshipEntity>{
          status: c.RelationshipStatus.FRIEND,
          account_id: acc1.account_id,
          following_id: acc1.account_id
        })
      ).rejects.toThrowError(
        new RegExp(
          '[error: new row for relation "relationship" violates check constraint "account_id_notequal_following_id"]'
        )
      ));
  });

  describe('friends, following, and followers', () => {
    const rnd = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1) + min);

    const followers = async (userId: number, noOfFollowers: number) => {
      const arr: c.AccountEntity[] = [];
      for (let i = 0; i < noOfFollowers; i++) {
        const uu = uuid();
        const d = await accStore.save({
          name: uu,
          dob: new Date().toISOString(),
          email: uu,
          uuid: uu,
          password: 'password'
        } as c.AccountEntity);

        await relStore.save(<c.RelationshipEntity>{
          status: c.RelationshipStatus.NOT_FRIEND,
          account_id: d.account_id,
          following_id: userId
        });
        arr[i] = d;
      }
      return arr;
    };

    it('followers. should return all accounts that follow acc1', async () => {
      // given
      const f = await followers(acc1.account_id, rnd(3, 10));

      // method to test
      const m = await relStore.followers(acc1.uuid);

      // assert
      expect(m.length).toEqual(f.length);
      expect(m).toEqual(f);
    });

    const followEachOther = async (userId: number, noFollowing: number) => {
      const arr: c.AccountEntity[] = [];
      for (let i = 0; i < noFollowing; i++) {
        const uu = uuid();
        const d = await accStore.save({
          name: uu,
          dob: new Date().toISOString(),
          email: uu,
          uuid: uu,
          password: 'password'
        } as c.AccountEntity);

        await relStore.save(<c.RelationshipEntity>{
          status: c.RelationshipStatus.FRIEND,
          account_id: userId,
          following_id: d.account_id
        });
        await relStore.save(<c.RelationshipEntity>{
          status: c.RelationshipStatus.FRIEND,
          account_id: d.account_id,
          following_id: userId
        });
        arr[i] = d;
      }
      return arr;
    };

    it('following. should return all accounts that acc1 follows', async () => {
      // given
      const f = await followEachOther(acc1.account_id, rnd(4, 7));

      // method to test
      const m = await relStore.followings(acc1.uuid);

      // assert
      expect(m.length).toEqual(f.length);
      expect(m).toEqual(f);
    });

    it('friends. should return all friends of acc1', async () => {
      // given
      const f = await followEachOther(acc1.account_id, rnd(3, 7));

      // method to test
      const m = await relStore.friends(acc1.uuid);

      // assert
      expect(m.length).toEqual(f.length);
      expect(m).toEqual(f);
    });
  });
});
