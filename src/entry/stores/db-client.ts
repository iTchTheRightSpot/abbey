import { Pool, PoolClient, QueryResult } from 'pg';

export interface IDatabaseClient {
  /**
   * Executes a SQL query (read/write) against the database.
   *
   * @param query - SQL query string.
   * @param args - Optional query parameters.
   * @returns A promise resolving to the query result or rejecting on failure.
   */
  exec(query: string, ...args: any[]): Promise<QueryResult>;
}

/**
 * Implementation of the {@link IDatabaseClient} for non-transactional operations.
 * Executes SQL queries and automatically releases the connection after each operation.
 */
export class DatabaseClient implements IDatabaseClient {
  constructor(private readonly pool: Pool) {}

  exec(query: string, ...args: any[]): Promise<QueryResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const q = await this.pool.query(query, [...args]);
        resolve(q);
      } catch (e) {
        reject(e);
      }
    });
  }
}

/**
 * Implementation of the {@link IDatabaseClient} for transactional operations.
 * Used within an active transaction context. Connection release is handled by
 * {@link TransactionProvider}.
 */
export class DatabaseTransactionClient implements IDatabaseClient {
  constructor(private readonly client: PoolClient) {}

  exec(query: string, ...args: any[]): Promise<QueryResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const q = await this.client.query(query, [...args]);
        resolve(q);
      } catch (e) {
        reject(e);
      }
    });
  }
}
