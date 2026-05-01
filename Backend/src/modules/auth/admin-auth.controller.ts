import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { AuthService } from './auth.service';
import { AdminsService } from '../users/services/admins.service';

function getAdminPayload(req: any): any {
  const authHeader = req.headers?.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedException('Not authenticated');
  }

  const token = authHeader.substring(7);
  const payload = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key') as any;
  if (!payload?.id || !payload?.isAdmin) {
    throw new UnauthorizedException('Invalid admin token');
  }

  return payload;
}

@ApiTags('admin-auth')
@Controller('admin')
export class AdminAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly adminsService: AdminsService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login' })
  async login(@Body() body: any) {
    const admin = await this.authService.validateAdmin(body.username, body.password);
    if (!admin) {
      throw new UnauthorizedException('Invalid username or password');
    }

    return {
      message: 'Admin login successful',
      ...await this.authService.loginAdmin(admin),
    };
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh admin token' })
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token required');
    }

    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET || 'your_secret_key') as any;
    if (!payload?.id || !payload?.isAdmin) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const admin = await this.adminsService.findOne(payload.id);
    return {
      message: 'Token refreshed successfully',
      ...await this.authService.loginAdmin(admin),
    };
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get admin profile' })
  async getProfile(@Req() req: any) {
    const payload = getAdminPayload(req);
    return this.adminsService.findOne(payload.id);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout admin' })
  logout() {
    return { success: true, message: 'Logged out successfully' };
  }

  @Post('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change admin password' })
  async changePassword(@Req() req: any, @Body() body: any) {
    const payload = getAdminPayload(req);
    const admin = await this.adminsService.findByUsernameOrEmail(payload.username || payload.email);
    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    const isMatch = await bcrypt.compare(body.currentPassword, (admin as any).password);
    if (!isMatch) {
      throw new UnauthorizedException('Current password incorrect');
    }

    await this.adminsService.update(payload.id, { password: body.newPassword });
    return { success: true, message: 'Password changed successfully' };
  }
}
