import request from 'supertest';
import { Application } from 'express';
import { Pool } from 'pg';
import { createApp } from '@abbey/app';
import * as u from '@utils/index';
import * as e from '@entry/index';
import * as c from '@core/index';
import { poolInstance, truncate } from '@mock/pool';
import { v4 as uuid } from 'uuid';

describe('account handler', () => {
  const logger = new u.DevelopmentLogger();
  let app: Application;
  let pool: Pool;
  let adapters: e.Adapters;
  let services: e.ServicesRegistry;
  let acc1: c.AccountEntity;
  let acc2: c.AccountEntity;

  beforeAll(async () => {
    pool = poolInstance(logger);
    const db = new e.DatabaseClient(pool);
    const tx = new e.TransactionProvider(logger, pool);
    adapters = e.initializeAdapters(logger, db, tx);

    const u = uuid();
    acc1 = await adapters.account.save(<c.AccountEntity>{
      name: 'iTchTheRightSpot',
      dob: '15/01/2000',
      email: `${u}@email.com`,
      uuid: u,
      password: 'password'
    });

    acc2 = await adapters.account.save(<c.AccountEntity>{
      name: 'u2',
      dob: '15/01/2001',
      email: `${u}1@email.com`,
      uuid: uuid(),
      password: 'password'
    });

    services = e.initializeServices(logger, adapters);
    app = createApp(logger, services);
  });

  afterAll(async () => {
    await truncate(pool);
    await pool.end();
  });

  const tokenBuilder = async (obj: c.JwtObject) =>
    await services.jwt.encode(obj, u.twoDaysInSeconds);

  describe('retrieve account', () => {
    it('success', async () =>
      await request(app)
        .get(`${u.env.ROUTE_PREFIX}account`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Cookie', [
          `${u.env.COOKIENAME}=${(await tokenBuilder({ user_id: acc1.uuid })).token}`
        ])
        .expect(200));

    it('fail. account not found', async () =>
      await request(app)
        .get(`${u.env.ROUTE_PREFIX}account`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Cookie', [
          `${u.env.COOKIENAME}=${(await tokenBuilder({ user_id: 'account.uuid' })).token}`
        ])
        .expect(404));
  });

  describe('updating account', () => {
    it('success', async () =>
      await request(app)
        .patch(`${u.env.ROUTE_PREFIX}account`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({ name: 'Wayne Rooney', dob: '14/12/2025' })
        .set('Cookie', [
          `${u.env.COOKIENAME}=${(await tokenBuilder({ user_id: acc1.uuid })).token}`
        ])
        .expect(204));

    it('fail. account not found', async () =>
      await request(app)
        .patch(`${u.env.ROUTE_PREFIX}account`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({ name: 'Frank White', dob: '14/12/2025' })
        .set('Cookie', [
          `${u.env.COOKIENAME}=${(await tokenBuilder({ user_id: uuid() })).token}`
        ])
        .expect(404));
  });

  it('should retrieve all accounts', async () =>
    await request(app)
      .get(`${u.env.ROUTE_PREFIX}accounts`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Cookie', [
        `${u.env.COOKIENAME}=${(await tokenBuilder({ user_id: acc1.uuid })).token}`
      ])
      .expect(200)
      .expect([
        {
          user_id: acc2.uuid,
          name: acc2.name,
          dob: acc2.dob,
          email: acc2.email
        }
      ]));
});
