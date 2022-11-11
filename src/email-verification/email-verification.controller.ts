import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import JwtAuthenticationGuard from 'src/authentication/jwt-authentication.guard';
import RequestWithUser from 'src/authentication/requestWithUser.interface';
import ConfirmEmailDto from './confirmEnail.dto';
import { EmailVerificationService } from './email-verification.service';

@Controller('email-verification')
export class EmailVerificationController {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @Post('confirm')
  @UseGuards(JwtAuthenticationGuard)
  async confirm(@Body() confirmationData: ConfirmEmailDto) {
    const email = await this.emailVerificationService.decodeConfirmationToken(
      confirmationData.token,
    );

    await this.emailVerificationService.confirmEmail(email);
  }

  @Post('resend-confirmation-link')
  @UseGuards(JwtAuthenticationGuard)
  async resendConfirmationLink(@Req() request: RequestWithUser) {
    await this.emailVerificationService.resendConfirmationLink(request.user.id);
  }
}
