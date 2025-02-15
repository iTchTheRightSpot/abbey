import * as u from '@utils/index';
import * as e from '@entry/index';
import * as c from '@core/index';

export interface IProfileStore {
  profileByEmail(email: string): Promise<c.ProfileEntity | undefined>;
  save(obj: c.ProfileEntity): Promise<c.ProfileEntity>;
}

export class ProfileStore implements IProfileStore {
  constructor(
    private readonly logger: u.ILogger,
    private readonly db: e.IDatabaseClient
  ) {}

  profileByEmail(email: string): Promise<c.ProfileEntity | undefined> {
    return new Promise<c.ProfileEntity | undefined>(async (resolve, reject) => {
      try {
        const result = await this.db.exec(
          'SELECT * FROM profile WHERE email = $1',
          email.trim()
        );
        const row = result.rows[0];
        if (row === undefined || row === null) {
          this.logger.error(`no profile with email ${email}`);
          resolve(undefined);
          return;
        }

        row.profile_id = Number(row.profile_id);
        resolve(row as c.ProfileEntity);
      } catch (e) {
        this.logger.error(`invalid profile with email ${email} err: ${e}`);
        reject(e);
      }
    });
  }

  save(p: c.ProfileEntity): Promise<c.ProfileEntity> {
    const query = `
        INSERT INTO profile (name, email, dob, uuid, password)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING profile_id;
    `;

    return new Promise<c.ProfileEntity>(async (resolve, reject) => {
      try {
        const res = await this.db.exec(
          query.trim(),
          p.name.trim(),
          p.email.trim(),
          p.dob.trim(),
          p.uuid.trim(),
          p.password
        );

        p.profile_id = Number((res.rows[0] as c.ProfileEntity).profile_id);
        resolve(p);
        this.logger.log('profile saved');
      } catch (e) {
        this.logger.error(`failed to save profile: ${e}`);
        reject(e);
      }
    });
  }
}
