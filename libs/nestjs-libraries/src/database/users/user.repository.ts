import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '../prisma.service';

@Injectable()
export class UserRepository {
  constructor(
    private _user: PrismaRepository<'user'>,
    private _job: PrismaRepository<'job'>,
  ) {}

  // async createUser(data: User): Promise<User> {
  //   return this._user.model.user.create({ data });
  // }
  //
  // async getUserById(id: number): Promise<User | null> {
  //   return this._user.model.user.findUnique({ where: { id } });
  // }
  //
  // async getAllUsers(): Promise<User[]> {
  //   return this._user.model.user.findMany();
  // }
  //
  // async updateUser(id: number, data: User): Promise<User> {
  //   return this._user.model.user.update({
  //     where: { id },
  //     data,
  //   });
  // }
  //
  // async deleteUser(id: number): Promise<User> {
  //   return this._user.model.user.delete({ where: { id } });
  // }
  //
  // async getUserJobListings(userId: number): Promise<Job[]> {
  //   return this._job.model.job.findMany({ where: { userId } });
  // }

}
