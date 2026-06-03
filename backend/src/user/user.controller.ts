import { Body, Controller, Get, Put, Query, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import {
  DataForUpdateEmailDto,
  DataForUpdateNameDto,
  DataForUpdatePasswordDto,
} from './dto/data-for-update-dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from 'src/common/types/authenticated-request';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findUser(@Request() req: AuthenticatedRequest) {
    return this.userService.findUserById(req.user.id);
  }

  @Put('update-user-name')
  updateUserName(
    @Request() req: AuthenticatedRequest,
    @Body() dataForUpdate: DataForUpdateNameDto,
  ) {
    return this.userService.updateUserName(req.user.id, dataForUpdate);
  }

  @Put('update-user-email')
  updateUserEmail(
    @Request() req: AuthenticatedRequest,
    @Body() dataForUpdate: DataForUpdateEmailDto,
  ) {
    return this.userService.updateUserEmail(req.user.id, dataForUpdate);
  }

  @Put('update-user-password')
  updateUserPassword(
    @Request() req: AuthenticatedRequest,
    @Body() dataForUpdate: DataForUpdatePasswordDto,
  ) {
    return this.userService.updateUserPassword(req.user.id, dataForUpdate);
  }
}
