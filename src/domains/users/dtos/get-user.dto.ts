import { Exclude, Expose } from 'class-transformer';

export class GetUserDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  email!: string;

  @Exclude()
  passwordHash!: string;

  @Exclude()
  createdAt!: Date;

  @Exclude()
  updatedAt!: Date;

  @Exclude()
  deletedAt!: Date | null;

  constructor(partial: Partial<GetUserDto>) {
    Object.assign(this, partial);
  }
}
