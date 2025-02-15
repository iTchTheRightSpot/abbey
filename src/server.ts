import * as u from '@utils/index';
import * as e from '@entry/index';
import { createApp } from './app';

const init = () => {
  const logger = u.env.COOKIESECURE
    ? new u.ProductionLogger(u.env.LOGGER)
    : new u.DevelopmentLogger();
  const pool = u.dbPool(logger);
  const db = new e.DatabaseClient(pool);
  const tx = new e.TransactionProvider(logger, pool);
  const adapters = e.initializeAdapters(logger, db, tx);
  const services = e.initializeServices(logger, adapters);

  return createApp(logger, services);
};

init().listen(u.env.PORT, () =>
  console.log(`api listening on port ${u.env.PORT}`)
);
