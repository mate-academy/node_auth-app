import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailModule } from 'src/mail/mail.module';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Module({
  controllers: [UserController],
  providers: [UserService, JwtAuthGuard],
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_ACCESS_SECRET,
      }),
    }),
    PrismaModule,
    MailModule,
  ],
})
export class UserModule {}
