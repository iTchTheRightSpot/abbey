import { Pool } from 'pg';
import { poolInstance, truncate } from '@mock/pool';
import * as c from '@core/index';
import * as e from '@entry/index';
import * as u from '@utils/index';
import { v4 as uuid } from 'uuid';
import { Application } from 'express';
import { createApp } from '@abbey/app';
import request from 'supertest';

const presave = async (a: e.Adapters) => {
  const acc1 = await a.account.save({
    name: 'one',
    dob: '01/01/0',
    email: 'one@email.com',
    uuid: uuid(),
    password: 'password'
  } as c.AccountEntity);

  const acc2 = await a.account.save({
    name: 'two',
    dob: '01/01/2',
    email: 'two@email.com',
    uuid: uuid(),
    password: 'password'
  } as c.AccountEntity);

  return { acc1, acc2 };
};

describe('relationship handler', () => {
  let app: Application;
  let pool: Pool;
  let adapters: e.Adapters;
  let services: e.ServicesRegistry;
  const logger = new u.DevelopmentLogger();
  let acc1: c.AccountEntity;
  let acc2: c.AccountEntity;

  beforeAll(async () => {
    pool = poolInstance(logger);
    const db = new e.DatabaseClient(pool);
    const tx = new e.TransactionProvider(logger, pool);
    adapters = e.initializeAdapters(logger, db, tx);

    const c = await presave(adapters);
    acc1 = c.acc1;
    acc2 = c.acc2;

    services = e.initializeServices(logger, adapters);
    app = createApp(logger, services);
  });

  afterAll(async () => {
    await truncate(pool);
    await pool.end();
  });

  const tokenBuilder = async (obj: c.JwtObject) =>
    await services.jwt.encode(obj, u.twoDaysInSeconds);

  describe('follow & friend request', () => {
    it('success. user1 follows a user2', async () =>
      await request(app)
        .post(`${u.env.ROUTE_PREFIX}relationship`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({ user_id: acc2.uuid })
        .set('Cookie', [
          `${u.env.COOKIENAME}=${(await tokenBuilder({ user_id: acc1.uuid })).token}`
        ])
        .expect(201));

    it('fail. user1 cannot follow user1', async () =>
      await request(app)
        .post(`${u.env.ROUTE_PREFIX}relationship`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({ user_id: acc1.uuid })
        .set('Cookie', [
          `${u.env.COOKIENAME}=${(await tokenBuilder({ user_id: acc1.uuid })).token}`
        ])
        .expect(400)
        .expect({ message: 'cannot follow yourself', status: 400 }));

    it('fail. invalid user id to follow', async () =>
      await request(app)
        .post(`${u.env.ROUTE_PREFIX}relationship`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({ user_id: 'uuid' })
        .set('Cookie', [
          `${u.env.COOKIENAME}=${(await tokenBuilder({ user_id: acc1.uuid })).token}`
        ])
        .expect(404));

    it('fail. user1 trying to follow user2 but already follows', async () =>
      await request(app)
        .post(`${u.env.ROUTE_PREFIX}relationship`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({ user_id: acc2.uuid })
        .set('Cookie', [
          `${u.env.COOKIENAME}=${(await tokenBuilder({ user_id: acc1.uuid })).token}`
        ])
        .expect(400)
        .expect({ message: 'already following account', status: 400 }));

    it('success. user2 follows back user1', async () =>
      await request(app)
        .post(`${u.env.ROUTE_PREFIX}relationship`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({ user_id: acc1.uuid })
        .set('Cookie', [
          `${u.env.COOKIENAME}=${(await tokenBuilder({ user_id: acc2.uuid })).token}`
        ])
        .expect(201));

    it('users should be friends as they follow each other', async () => {
      const u1 =
        await adapters.relationship.relationshipByAccountAndFollowingId(
          acc1.account_id,
          acc2.account_id
        );
      expect(u1).toBeDefined();
      expect(u1!.status).toEqual(c.RelationshipStatus.FRIEND);

      const u2 =
        await adapters.relationship.relationshipByAccountAndFollowingId(
          acc2.account_id,
          acc1.account_id
        );
      expect(u2).toBeDefined();
      expect(u2!.status).toEqual(c.RelationshipStatus.FRIEND);
    });
  });

  describe('unfollow & unfriending', () => {
    it('success. user1 unfollows a user2', async () =>
      await request(app)
        .patch(`${u.env.ROUTE_PREFIX}relationship`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({ user_id: acc2.uuid })
        .set('Cookie', [
          `${u.env.COOKIENAME}=${(await tokenBuilder({ user_id: acc1.uuid })).token}`
        ])
        .expect(204));

    it('fail. user1 cannot unfollow user1', async () =>
      await request(app)
        .patch(`${u.env.ROUTE_PREFIX}relationship`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({ user_id: acc1.uuid })
        .set('Cookie', [
          `${u.env.COOKIENAME}=${(await tokenBuilder({ user_id: acc1.uuid })).token}`
        ])
        .expect(400)
        .expect({ message: 'cannot unfollow yourself', status: 400 }));

    it('fail. invalid user id to unfollow', async () =>
      await request(app)
        .patch(`${u.env.ROUTE_PREFIX}relationship`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({ user_id: 'uuid' })
        .set('Cookie', [
          `${u.env.COOKIENAME}=${(await tokenBuilder({ user_id: acc1.uuid })).token}`
        ])
        .expect(404));

    it('fail. user1 trying to unfollow user2 but already unfollowed', async () =>
      await request(app)
        .patch(`${u.env.ROUTE_PREFIX}relationship`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({ user_id: acc2.uuid })
        .set('Cookie', [
          `${u.env.COOKIENAME}=${(await tokenBuilder({ user_id: acc1.uuid })).token}`
        ])
        .expect(400)
        .expect({ message: 'you are not following account', status: 400 }));

    it('success. user2 unfollows user1', async () =>
      await request(app)
        .patch(`${u.env.ROUTE_PREFIX}relationship`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({ user_id: acc1.uuid })
        .set('Cookie', [
          `${u.env.COOKIENAME}=${(await tokenBuilder({ user_id: acc2.uuid })).token}`
        ])
        .expect(204));

    it('users should have no relationship', async () => {
      const u1 =
        await adapters.relationship.relationshipByAccountAndFollowingId(
          acc1.account_id,
          acc2.account_id
        );
      expect(u1).toBeUndefined();

      const u2 =
        await adapters.relationship.relationshipByAccountAndFollowingId(
          acc2.account_id,
          acc1.account_id
        );
      expect(u2).toBeUndefined();
    });
  });
});
