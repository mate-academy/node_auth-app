import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  DataForUpdateEmailDto,
  DataForUpdateNameDto,
  DataForUpdatePasswordDto,
} from './dto/data-for-update-dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { normalizeUser } from 'src/utils/normalizeUser';
import { MailService } from 'src/mail/mail.service';
import { createHash, randomBytes } from 'crypto';
import bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async findUserById(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException();
    }

    return normalizeUser(user);
  }

  async updateUserName(userId: number, dataForUpdate: DataForUpdateNameDto) {
    const newName = dataForUpdate.newName.trim();
    if (!newName) {
      throw new BadRequestException({ message: 'Name is required' });
    }

    try {
      const updateUser = await this.prisma.user.update({
        where: { id: userId },
        data: { name: newName },
      });
      return normalizeUser(updateUser);
    } catch {
      throw new BadRequestException({ message: 'Could not update name' });
    }
  }

  async updateUserEmail(userId: number, dataForUpdate: DataForUpdateEmailDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordValid = await bcrypt.compare(
      dataForUpdate.password,
      user.password || '',
    );

    if (!passwordValid) {
      throw new BadRequestException({
        message: 'Invalid password',
        code: 'INVALID_PASSWORD',
      });
    }

    const emailTaken = await this.prisma.user.findUnique({
      where: { email: dataForUpdate.newEmail },
    });

    if (emailTaken && emailTaken.id !== user.id) {
      throw new BadRequestException({
        message: 'Email is already in use',
        code: 'EMAIL_IN_USE',
      });
    }

    const rawActivationToken = randomBytes(32).toString('hex');
    const activationTokenHash = createHash('sha256')
      .update(rawActivationToken)
      .digest('hex');
    const activationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:3000';
    const activationLink = `${clientUrl}/activate-new-email?activateToken=${rawActivationToken}`;
    const newEmail = dataForUpdate.newEmail;

    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          activationTokenHash,
          activationTokenExpiresAt,
          pendingNewEmail: newEmail,
        },
      });

      await this.mailService.sendActivationChangeEmail(newEmail, activationLink);

      return {
        statusCode: 200,
        message: 'ok',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Could not send activation email',
        code: 'ACTIVATION_EMAIL_FAILED',
      });
    }
  }

  async updateUserPassword(
    userId: number,
    dataForUpdate: DataForUpdatePasswordDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordValid = await bcrypt.compare(
      dataForUpdate.password,
      user.password || '',
    );

    if (!passwordValid) {
      throw new BadRequestException({
        message: 'Invalid password',
        code: 'INVALID_PASSWORD',
      });
    }

    const hashedPassword = await bcrypt.hash(dataForUpdate.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    return {
      statusCode: 200,
      message: 'ok',
    };
  }
}
