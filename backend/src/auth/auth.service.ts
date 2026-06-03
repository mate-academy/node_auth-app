import {
  BadRequestException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response } from 'express';
import { CreateAuthDto } from './dto/create-auth-dto';
import { PrismaService } from 'src/prisma/prisma.service';
import bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { MailService } from 'src/mail/mail.service';
import { normalizeUser } from 'src/utils/normalizeUser';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login-dto';
import { jwt } from 'src/utils/jwt';
import { CompleteResetPasswordDto } from './dto/complete-reset-password-dto';
import { GoogleLoginDto } from './dto/google-login-dto';
import { ResetPasswordDto } from './dto/reset-password-dto';
import client from 'src/utils/googleClient';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  private async issueSession(
    res: Response,
    user: { id: number; name: string | null; email: string },
  ) {
    const normalizedUser = normalizeUser(user);
    const accessToken = jwt.generateAccessToken(normalizedUser);
    const refreshToken = jwt.generateRefreshToken(normalizedUser);
    const hashedRefreshAccessToken = createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshAccessTokenHash: hashedRefreshAccessToken },
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { normalizedUser, accessToken };
  }
  
  async create(createAuthDto: CreateAuthDto) {
    const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);
    const rawActivationToken = randomBytes(32).toString('hex');
    const activationTokenHash = createHash('sha256').update(rawActivationToken).digest('hex');
    const activationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:3000';
    const activationLink = `${clientUrl}/activate?activateToken=${rawActivationToken}`;

    try {
      const newUser = await this.prisma.user.create({
        data: {
          name: createAuthDto.name,
          email: createAuthDto.email,
          password: hashedPassword,
          activationTokenHash,
          activationTokenExpiresAt,
          isActivated: false,
        },
      });
      if (newUser) {
        await this.mailService.sendActivationEmail(newUser.email, activationLink);
        return { 
          statusCode: 200,
          message: 'ok' 
        };
      } else {
        throw new BadRequestException({
          statusCode: 400,
          message: "Can't create a new user",
          error: 'Bad Request',
        });
      }
    } catch (error) {
      throw new BadRequestException({
        statusCode: 400,
        message: "Can't create a new user",
        error: 'Bad Request',
      });
  }
  }

  async activate(activateToken: string, res) {
    if (!activateToken || typeof activateToken !== 'string') {
      throw new BadRequestException('Activation token is required');
    }

    const activationTokenHash = createHash('sha256').update(activateToken).digest('hex');

    try {
      const user = await this.prisma.user.findFirst({
        where: {
          activationTokenHash,
          activationTokenExpiresAt: { gt: new Date() },
          isActivated: false,
        },
      });

      if (!user) {
        throw new BadRequestException({
          statusCode: 400,
          message: 'Invalid or expired activation token',
          error: 'Bad Request',
        });
      }
      
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          isActivated: true,
          activationTokenHash: null,
          activationTokenExpiresAt: null,
        },
      });

      const { normalizedUser, accessToken } = await this.issueSession(res, user);

      res.status(200).json({
        normalizedUser,
        accessToken,
      });

      return { message: 'Account activated', statusCode: 200 };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: 400,
        message:
          error instanceof Error ? error.message : 'Activation failed',
        error: 'Bad Request',
      });
    }
  }

  async login(data: LoginDto, res) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email}
    })

    if (!user ) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const compare = await bcrypt.compare(data.password, user.password || '')

    if(!compare) {
      throw new UnauthorizedException('Invalid credentials')
    };

    if (!user.isActivated) {
      const normalizedUser = { id: user.id, activationToken: true}
      res.status(200).json({ normalizedUser })
      return;
    }

    const normalizedUser = normalizeUser(user);

    const accessToken = jwt.generateAccessToken(normalizedUser);
    const refreshToken = jwt.generateRefreshToken(normalizedUser);

    const hashedRefreshAccessToken = createHash('sha256').update(refreshToken).digest('hex');

    await this.prisma.user.update({
      where: { id: user.id},
      data: {refreshAccessTokenHash: hashedRefreshAccessToken},
    })

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,      // dev only
      sameSite: "lax",
      path: "/",
      maxAge: 1 * 1 * 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,      // dev only
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });


    res.status(200).json(
      {
      normalizedUser,
      accessToken,
    })
    return {
      normalizedUser,
      accessToken,
    }
  }

  async refresh(req, res) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const verifiedPayload = await this.jwtService.verifyAsync(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });

    if (!verifiedPayload) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const normalizedUser = {
      id: verifiedPayload.id,
      email: verifiedPayload.email,
      name: verifiedPayload.name,
    };

    const user = await this.prisma.user.findUnique({
      where: { id: normalizedUser.id }
    })

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const refreshTokenDb = user.refreshAccessTokenHash || '';
    const hashedIncomingRefreshToken = createHash('sha256').update(refreshToken).digest('hex');

    const compare = hashedIncomingRefreshToken === refreshTokenDb;

    if (!compare) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = jwt.generateAccessToken(normalizedUser);
    const newRefreshToken = jwt.generateRefreshToken(normalizedUser);

    const hashedRefreshAccessToken = createHash('sha256').update(newRefreshToken).digest('hex');

    await this.prisma.user.update({
      where: { id: normalizedUser.id},
      data: {refreshAccessTokenHash: hashedRefreshAccessToken},
    })

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: false,      // dev only
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,      // dev only
      sameSite: "lax",
      path: "/",
      maxAge: 1 * 1 * 15 * 60 * 1000,
    });

    res.status(200).json(
      {
      normalizedUser,
      accessToken,
    })

    return {
      normalizedUser,
      accessToken,
    }
  }

  async logout(res) {
    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
    res.status(200).json({ ok: true });
    return;
  }

  async activateNewEmail(activateToken: string, res) {
    if (!activateToken || typeof activateToken !== 'string') {
      throw new BadRequestException('Activation token is required');
    }

    const activationTokenHash = createHash('sha256').update(activateToken).digest('hex');

    try {
      const user = await this.prisma.user.findFirst({
        where: {
          activationTokenHash,
          activationTokenExpiresAt: { gt: new Date() },
        },
      });

      if (!user) {
        throw new BadRequestException({
          statusCode: 400,
          message: 'Invalid or expired activation token',
          error: 'Bad Request',
        });
      }
      
      const oldEmail = user.email;
      const newEmail = user.pendingNewEmail || '';
      if (!newEmail) {
        throw new BadRequestException({
          statusCode: 400,
          message: 'Invalid or expired activation token',
          error: 'Bad Request',
        });
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          activationTokenHash: null,
          activationTokenExpiresAt: null,
          email: newEmail,
          pendingNewEmail: null,
        },
      });

      await this.mailService.sendChangeEmailNotify(oldEmail);

      const { normalizedUser, accessToken } = await this.issueSession(
        res,
        updatedUser,
      );

      res.status(200).json({
        normalizedUser,
        accessToken,
      });

      return { message: 'New email activated', statusCode: 200 };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: 400,
        message: 'Invalid or expired activation token',
        error: 'Bad Request',
      });
    }
  }

  async resetPassword(data: ResetPasswordDto, res: Response) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (user) {
      const rawResetToken = randomBytes(32).toString('hex');
      const resetTokenHash = createHash('sha256')
        .update(rawResetToken)
        .digest('hex');
      const resetTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:3000';
      const resetLink = `${clientUrl}/reset-password/confirmed?resetToken=${rawResetToken}`;

      try {
        await this.prisma.user.update({
          where: { email: data.email },
          data: {
            resetPasswordTokenHash: resetTokenHash,
            resetPasswordTokenExpiresAt: resetTokenExpiresAt,
          },
        });
        await this.mailService.sendActivationResetPassword(data.email, resetLink);
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }
        throw new BadRequestException({
          message: 'Error during sent email',
          code: 'RESET_EMAIL_FAILED',
        });
      }
    }

    res.status(200).json({
      statusCode: 200,
      message: 'ok',
    });
  }

  async completeResetPassword(data: CompleteResetPasswordDto, res: Response) {
    const resetTokenHash = createHash('sha256')
      .update(data.resetToken)
      .digest('hex');

    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordTokenHash: resetTokenHash,
        resetPasswordTokenExpiresAt: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException({
        message: 'Invalid or expired reset token',
        code: 'INVALID_RESET_TOKEN',
      });
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordTokenHash: null,
        resetPasswordTokenExpiresAt: null,
      },
    });

    res.status(200).json({
      statusCode: 200,
      message: 'ok',
    });
  }

  async loginWithGoogle(data: GoogleLoginDto, res: Response) {
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: data.idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException({
        message: 'Invalid Google token',
        code: 'INVALID_GOOGLE_TOKEN',
      });
    }

    if (!payload?.sub || !payload.email) {
      throw new BadRequestException({
        message: 'Google account email is required',
        code: 'GOOGLE_EMAIL_REQUIRED',
      });
    }

    let user =
      (await this.prisma.user.findFirst({
        where: { googleId: payload.sub },
      })) ??
      (await this.prisma.user.findUnique({
        where: { email: payload.email },
      }));

    if (user) {
      if (!user.googleId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: payload.sub,
            isActivated: true,
            activationTokenHash: null,
            activationTokenExpiresAt: null,
          },
        });
      }
    } else {
      user = await this.prisma.user.create({
        data: {
          googleId: payload.sub,
          name: payload.name ?? null,
          email: payload.email,
          isActivated: true,
        },
      });
    }

    const { normalizedUser, accessToken } = await this.issueSession(res, user);

    res.status(200).json({
      normalizedUser,
      accessToken,
    });
  }
}