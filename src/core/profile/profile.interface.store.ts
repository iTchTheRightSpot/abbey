import { ProfileEntity } from '@core/profile/profile.model';

export interface IProfileStore {
  profileByEmail(email: string): Promise<ProfileEntity | undefined>;
  save(obj: ProfileEntity): Promise<ProfileEntity>;
}
