import * as u from '@utils/index';
import * as e from '@entry/index';
import * as c from '@core/index';

export interface IAccountStore {
  accountByEmail(email: string): Promise<c.AccountEntity | undefined>;
  save(obj: c.AccountEntity): Promise<c.AccountEntity>;
  update(obj: c.AccountEntity): Promise<c.AccountEntity>;
  accountByUUID(uuid: string): Promise<c.AccountEntity | undefined>;
}

export class AccountStore implements IAccountStore {
  constructor(
    private readonly logger: u.ILogger,
    private readonly db: e.IDatabaseClient
  ) {}

  accountByEmail(email: string): Promise<c.AccountEntity | undefined> {
    return new Promise<c.AccountEntity | undefined>(async (resolve, reject) => {
      try {
        const result = await this.db.exec(
          'SELECT * FROM account WHERE email = $1',
          email.trim()
        );
        const row = result.rows[0];
        if (row === undefined || row === null) {
          this.logger.error(`no account associated with email: ${email}`);
          resolve(undefined);
          return;
        }

        row.account_id = Number(row.account_id);
        resolve(row as c.AccountEntity);
      } catch (e) {
        this.logger.error(`invalid account with email ${email} err: ${e}`);
        reject(e);
      }
    });
  }

  accountByUUID(uuid: string): Promise<c.AccountEntity | undefined> {
    return new Promise<c.AccountEntity | undefined>(async (resolve, reject) => {
      try {
        const result = await this.db.exec(
          'SELECT * FROM account WHERE uuid = $1',
          uuid.trim()
        );
        const row = result.rows[0];
        if (row === undefined || row === null) {
          this.logger.error(`no account associated to uuid: ${uuid}`);
          resolve(undefined);
          return;
        }

        row.account_id = Number(row.account_id);
        resolve(row as c.AccountEntity);
      } catch (e) {
        this.logger.error(`invalid account with uuid ${uuid} err: ${e}`);
        reject(e);
      }
    });
  }

  save(p: c.AccountEntity): Promise<c.AccountEntity> {
    const query = `
        INSERT INTO account (name, email, dob, uuid, password)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING account_id;
    `;

    return new Promise<c.AccountEntity>(async (resolve, reject) => {
      try {
        const res = await this.db.exec(
          query.trim(),
          p.name.trim(),
          p.email.trim(),
          p.dob.trim(),
          p.uuid.trim(),
          p.password
        );

        p.account_id = Number((res.rows[0] as c.AccountEntity).account_id);
        resolve(p);
        this.logger.log('account saved');
      } catch (e) {
        this.logger.error(`failed to save account: ${e}`);
        reject(e);
      }
    });
  }

  update(p: c.AccountEntity): Promise<c.AccountEntity> {
    const query = `
        UPDATE account
            SET
                name = $2,
                dob = $3,
                password = $4
        WHERE uuid = $1
        RETURNING account_id;
    `;

    return new Promise<c.AccountEntity>(async (resolve, reject) => {
      try {
        const res = await this.db.exec(
          query.trim(),
          p.uuid.trim(),
          p.name.trim(),
          p.dob.trim(),
          p.password
        );

        p.account_id = Number((res.rows[0] as c.AccountEntity).account_id);
        resolve(p);
        this.logger.log('account updated');
      } catch (e) {
        this.logger.error(`error updating account: ${e}`);
        reject(e);
      }
    });
  }
}
