import { Injectable } from '@nestjs/common';
import { Expanse, Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import e from 'express';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async getUser(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }

  async getUserExpanses(
    where: Prisma.UserWhereUniqueInput,
  ): Promise<{ expanses: Expanse[] }> {
    return this.prisma.user.findUnique({
      where,
      select: { expanses: true },
    });
  }

  async setCurrentRefreshToken(refreshToken: string, userId: number) {
    const currentHshedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshjwt: currentHshedRefreshToken,
      },
    });
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: number) {
    const user = await this.getUser({ id: userId });

    const isRefreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshjwt,
    );
    if (isRefreshTokenMatches) {
      return user;
    }
  }

  async removeRefreshToken(userId: number) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshjwt: null,
      },
    });
  }

  async markEmailAsConfirmed(email: string) {
    return this.prisma.user.update({
      where: {
        email,
      },
      data: {
        isEmailConfirmed: true,
      },
    });
  }
}
