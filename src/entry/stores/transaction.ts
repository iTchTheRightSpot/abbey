import { Pool, PoolClient } from 'pg';
import * as u from '@utils/index';
import * as e from '@entry/index';

export enum TransactionIsolationLevel {
  READ_COMMITTED = 'BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED'
}

export interface ITransactionProvider {
  /**
   * Executes the provided function within a database transaction.
   * If the function completes successfully, the transaction is committed;
   * if an error occurs, the transaction is rolled back.
   *
   * @param txFunc - A function that receives an instance of Adapters
   * and contains the operations to be executed in the transaction.
   * @param isolation
   * @returns A promise that resolves when the transaction is complete.
   */
  runInTransaction<T>(
    txFunc: (adapters: e.Adapters) => Promise<T>,
    isolation?: TransactionIsolationLevel
  ): Promise<T>;
}

export class TransactionProvider implements ITransactionProvider {
  constructor(
    private readonly logger: u.ILogger,
    private readonly pool: Pool
  ) {}

  async runInTransaction<T>(
    txFunc: (adapters: e.Adapters) => Promise<T>,
    isolation: TransactionIsolationLevel = TransactionIsolationLevel.READ_COMMITTED
  ): Promise<T> {
    let oc: PoolClient | undefined;

    try {
      oc = await this.pool.connect();
      this.logger.log(isolation);
      await oc.query(isolation);
      const result = await txFunc(
        e.initializeAdapters(this.logger, new e.DatabaseTransactionClient(oc))
      );
      await oc.query('COMMIT');
      this.logger.log('TRANSACTION COMMITTED');
      return result;
    } catch (err) {
      if (oc) {
        await oc.query('ROLLBACK');
        this.logger.error(`TRANSACTION ROLLED BACK.`, err);
      } else this.logger.error(`TRANSACTION NEVER STARTED`, err);
      throw err;
    } finally {
      if (oc) {
        oc.release();
        this.logger.log('pool client released');
      } else this.logger.error('TRANSACTION NEVER STARTED');
    }
  }
}
