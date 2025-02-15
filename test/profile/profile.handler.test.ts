import request from 'supertest';
import { Application } from 'express';
import { Pool } from 'pg';
import { createApp } from '@abbey/app';
import * as u from '@utils/index';
import * as e from '@entry/index';
import * as c from '@core/index';
import { poolInstance, truncate } from '@mock/pool';

describe('profile handler', () => {
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

  afterEach(async () => await truncate(pool));

  afterAll(async () => await pool.end());

  const tokenBuilder = async (obj: c.JwtObject) =>
    await services.jwt.encode(obj, u.twoDaysInSeconds);
});
