import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import TokenPayload from './tokenPayload.interface';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async register(registrationData: Prisma.UserCreateInput) {
    const hashedPassword = await bcrypt.hash(registrationData.password, 10);
    try {
      const createdUser = await this.userService.createUser({
        ...registrationData,
        password: hashedPassword,
      });
      return createdUser;
    } catch (e) {
      if (e.code === 'P2002') {
        throw new HttpException(
          'User with this email already exist',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Provide name, email and password',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  public async getAuthenticatedUser(email: string, hashedPassword: string) {
    try {
      const user = await this.userService.getUserByEmail(email);
      await this.verifyPassword(hashedPassword, user.password);

      return user;
    } catch (error) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );
    if (!isPasswordMatching) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public getCookieWithJwtToken(userId: number) {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload);

    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      'JWT_EXPIRATION_TIME',
    )}; SameSite=None; Secure`;
  }

  public getCookieWithJwtRefreshToken(userId: number) {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
      )}`,
    });

    const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
    )}; SameSite=None; Secure`;

    return {
      cookie,
      token,
    };
  }

  public getCookieForLogOut() {
    return [
      'Authentication=; HttpOnly; Path=/; Max-Age=0; SameSite=None; Secure',
      'Refresh=; HttpOnly; Path=/; Max-Age=0; SameSite=None; Secure',
    ];
  }

  public async resetPassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
    confirmationPassword: string,
  ) {
    const user = await this.userService.getUser({
      id: userId,
    });

    this.verifyPassword(oldPassword, user.password);

    if (confirmationPassword === newPassword) {
      const encriptedNewPassword = await bcrypt.hash(newPassword, 10);
      this.userService.updateUser({
        where: {
          id: userId,
        },
        data: {
          ...user,
          password: encriptedNewPassword,
        },
      });

      return user;
    }
  }
}
