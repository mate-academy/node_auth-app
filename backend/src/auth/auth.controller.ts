import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  Response,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth-dto';
import { LoginDto } from './dto/login-dto';
import { CompleteResetPasswordDto } from './dto/complete-reset-password-dto';
import { GoogleLoginDto } from './dto/google-login-dto';
import { ResetPasswordDto } from './dto/reset-password-dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @Get('/activate')
  activate(@Query('activateToken') activateToken: string, @Response() res) {
    return this.authService.activate(activateToken, res);
  }

  @Post('/sign-in')
  login(@Body() data: LoginDto, @Response() res){
    return this.authService.login(data, res);
  }

  @Get('/refresh')
  refresh(@Request() req, @Response() res) {
    return this.authService.refresh(req, res);
  }

  @Get('/sign-out')
  logout(@Response() res) {
    return this.authService.logout(res);
  }

  @Get('/activate-new-email')
  activateNewEmail(@Query('activateToken') activateToken: string, @Response() res) {
    return this.authService.activateNewEmail(activateToken, res);
  }

  @Post('/reset-password')
  resetPassword(@Body() data: ResetPasswordDto, @Response() res){
    return this.authService.resetPassword(data, res);
  }

  @Post('/reset-password/confirmed')
  completeResetPassword(
    @Body() data: CompleteResetPasswordDto,
    @Response() res,
  ) {
    return this.authService.completeResetPassword(data, res);
  }

  @Post('/google')
  loginWithGoogle(@Body() data: GoogleLoginDto, @Response() res) {
    return this.authService.loginWithGoogle(data, res);
  }
}
