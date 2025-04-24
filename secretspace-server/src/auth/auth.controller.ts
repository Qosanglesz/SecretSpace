import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UsersService) {}

  @Post('login')
  @HttpCode(200)
  async login(
      @Body() body: { username: string; password: string },
      @Res({ passthrough: true }) res: Response,
  ) {
    const { token } = await this.userService.login(
        body.username,
        body.password,
    );
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24,
    });
    return { message: 'Login successful' };
  }

  @Get('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt');
    return { message: 'Logout successful' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req): { username: string } {
    return {
      username: req.user.username,
    };
  }
}