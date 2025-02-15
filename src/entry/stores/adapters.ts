import * as u from '@utils/index';
import * as e from '@entry/index';
import * as c from '@core/index';

/**
 * Holds all classes that directly communicate with the database.
 * Provides access to specific data stores and optional transaction management.
 */
export interface Adapters {
  account: c.IAccountStore;
  relationship: c.IRelationshipStore;
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
  account: new c.AccountStore(logger, client),
  relationship: new c.RelationShipStore(logger, client),
  transaction: tx
});
