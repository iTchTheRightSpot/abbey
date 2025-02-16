import request from 'supertest';
import { Application } from 'express';
import { Pool } from 'pg';
import { createApp } from '@abbey/app';
import * as u from '@utils/index';
import * as e from '@entry/index';
import { poolInstance, truncate } from '@mock/pool';
import { v4 as uuid } from 'uuid';

describe('flow to register, login, and logout', () => {
  const logger = new u.DevelopmentLogger();
  let app: Application;
  let pool: Pool;
  let adapters: e.Adapters;
  let services: e.ServicesRegistry;

  beforeAll(async () => {
    pool = poolInstance(logger);
    const db = new e.DatabaseClient(pool);
    const tx = new e.TransactionProvider(logger, pool);
    adapters = e.initializeAdapters(logger, db, tx);
    services = e.initializeServices(logger, adapters);
    app = createApp(logger, services);
  });

  afterAll(async () => {
    await truncate(pool);
    await pool.end();
  });

  const email = `${uuid()}@email.com`;
  const password = 'paSsw$@orD123#';

  describe('success', () => {
    let cookie = '';

    it('register', async () =>
      await request(app)
        .post(`${u.env.ROUTE_PREFIX}auth/register`)
        .send({
          name: email,
          dob: '15/01/2000',
          email: email,
          password: password
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(201));

    it('login', async () => {
      const r = await request(app)
        .post(`${u.env.ROUTE_PREFIX}auth/login`)
        .send({ email: email, password: password })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(204);

      cookie = r.headers['set-cookie'][0];
    });

    it('logout', async () =>
      await request(app)
        .post(`${u.env.ROUTE_PREFIX}logout`)
        .set('Cookie', [cookie])
        .expect(204));
  });

  describe('fail', () => {
    it('should reject registration email exists', async () =>
      await request(app)
        .post(`${u.env.ROUTE_PREFIX}auth/register`)
        .send({
          name: 'firstname',
          dob: '15/01/2001',
          email: email,
          password: password
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(409));

    it('should reject login invalid password', async () =>
      await request(app)
        .post(`${u.env.ROUTE_PREFIX}auth/login`)
        .send({ email: email, password: 'password' })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(401));
  });
});
