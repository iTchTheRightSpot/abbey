import * as u from '@utils/index';
import * as e from '@entry/index';
import * as c from '@core/index';

/**
 * Holds all classes that directly communicate with the database.
 * Provides access to specific data stores and optional transaction management.
 */
export interface Adapters {
  profileStore: c.IProfileStore;
  transaction?: e.ITransactionProvider;
}

/**
 * Creates an instance of the {@link Adapters}.
 *
 * @param logger - A logging instance.
 * @param client - An instance of {@link IDatabaseClient} for interacting with db.
 * @param tx - An optional instance of {@link ITransactionProvider} for handling transactions.
 */
export const initializeAdapters = (
  logger: u.ILogger,
  client: e.IDatabaseClient,
  tx?: e.ITransactionProvider
): Adapters => ({
  profileStore: new c.ProfileStore(logger, client),
  transaction: tx
});
