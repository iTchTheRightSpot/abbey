import { Pool } from 'pg';
import * as u from '@utils/index';

let pool: Pool | undefined = undefined;

export const poolInstance = (logger: u.ILogger) => {
  if (!pool) {
    pool = u.dbPool(logger);
  }
  return pool;
};

export const truncate = async (p: Pool) =>
  await p.query('TRUNCATE profile CASCADE');
