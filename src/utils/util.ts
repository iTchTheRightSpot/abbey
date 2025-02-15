import { Pool } from 'pg';
import * as e from '@utils/index';

export const twoDaysInSeconds = 172800;

export const dbPool = (logger: e.ILogger) =>
  new Pool({
    user: e.env.DB_CONFIG.user,
    password: e.env.DB_CONFIG.password,
    host: e.env.DB_CONFIG.host,
    port: e.env.DB_CONFIG.port,
    database: e.env.DB_CONFIG.database,
    min: 10,
    max: 25,
    // log: (m) => logger.log(m),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  });
