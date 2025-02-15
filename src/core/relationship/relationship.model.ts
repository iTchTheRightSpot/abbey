import { IsDefined, IsNotEmpty, MaxLength } from 'class-validator';

export enum RelationshipStatus {
  FRIEND = 'FRIEND',
  NOT_FRIEND = 'NOT_FRIEND'
}

export interface RelationshipEntity {
  relation_id: number;
  status: RelationshipStatus;
  account_id: number;
  following_id: number;
}

export class FollowPayload {
  @IsDefined({ message: 'user_id is missing' })
  @IsNotEmpty({ message: 'user_id cannot be empty' })
  @MaxLength(36, { message: 'user_id must be at min 36 characters' })
  @MaxLength(37, { message: 'user_id must be at most 37 characters' })
  user_id: string;
}
