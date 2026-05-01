import { Body, Controller, Delete, Get, Param, Post, Put, Req, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as jwt from 'jsonwebtoken';
import { AdminsService } from './services/admins.service';
import { CustomersService } from './services/customers.service';
import { AuthService } from '../auth/auth.service';

function getAdminPayload(req: any): any {
  const authHeader = req.headers?.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedException('Not authenticated. Please provide a valid Bearer token.');
  }

  try {
    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET || 'anne_creations_secret_key_2024';
    const decoded = jwt.verify(token, secret) as any;
    if (!decoded.isAdmin) {
      throw new UnauthorizedException('Access denied. Admin privileges required.');
    }
    return decoded;
  } catch (error) {
    if (error instanceof UnauthorizedException) throw error;
    throw new UnauthorizedException('Invalid or expired admin token');
  }
}

@ApiTags('admins-admin')
@Controller('admin')
export class AdminsAdminController {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly customersService: CustomersService,
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Admin login' })
  async login(@Body() body: any) {
    const admin = await this.authService.validateAdmin(body.username, body.password);
    if (!admin) {
      throw new UnauthorizedException('Invalid username or password');
    }
    const result = await this.authService.loginAdmin(admin);
    return {
      success: true,
      message: 'Admin login successful',
      ...result,
    };
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Admin refresh token' })
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token required');
    }
    try {
      const secret = process.env.JWT_SECRET || 'anne_creations_secret_key_2024';
      const payload = jwt.verify(refreshToken, secret) as any;
      if (!payload.isAdmin) throw new UnauthorizedException('Invalid token type');
      
      const admin = await this.adminsService.findOne(payload.id);
      if (!admin) throw new UnauthorizedException('Admin not found');
      
      return this.authService.loginAdmin(admin);
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin logout' })
  async logout() {
    return { success: true, message: 'Logged out successfully' };
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current admin profile' })
  async getProfile(@Req() req: any) {
    const payload = getAdminPayload(req);
    const admin = await this.adminsService.findOne(payload.id);
    return { success: true, data: admin };
  }

  @Get('all')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List admins for admin portal' })
  async findAll(@Req() req: any) {
    getAdminPayload(req);
    return this.adminsService.findAll(req.query || {});
  }

  @Get(':id/profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get admin by ID' })
  async findOne(@Req() req: any, @Param('id') id: string) {
    getAdminPayload(req);
    return { success: true, data: await this.adminsService.findOne(id) };
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create admin user' })
  async create(@Req() req: any, @Body() body: any) {
    getAdminPayload(req);
    const admin = await this.adminsService.create({
      ...body,
      role: body.roleId || body.role,
      status: body.status ?? true,
    });
    return { success: true, data: admin };
  }

  @Put(':id/update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update admin user' })
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    getAdminPayload(req);
    const admin = await this.adminsService.update(id, {
      ...body,
      role: body.roleId || body.role,
      password: body.newPassword || undefined,
    });
    return { success: true, data: admin };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete admin user' })
  async remove(@Req() req: any, @Param('id') id: string) {
    getAdminPayload(req);
    await this.adminsService.remove(id);
    return { success: true, message: 'Admin deleted successfully' };
  }

  @Put(':id/role')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign role to admin user' })
  async assignRole(@Req() req: any, @Param('id') id: string, @Body('roleId') roleId: string) {
    getAdminPayload(req);
    const admin = await this.adminsService.update(id, { role: roleId });
    return { success: true, data: admin };
  }

  @Get(':id/permissions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get admin permissions' })
  async getPermissions(@Req() req: any, @Param('id') id: string) {
    getAdminPayload(req);
    const admin: any = await this.adminsService.findOne(id);
    return {
      success: true,
      data: {
        isSuperAdmin: admin?.isSuperAdmin || false,
        permissions: admin?.role?.permissions || [],
      },
    };
  }

  @Post('login-as-user')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin login as customer' })
  async loginAsUser(@Req() req: any, @Body('customerId') customerId: string) {
    const adminPayload = getAdminPayload(req);
    const customer = await this.customersService.findOne(customerId);
    const tokens = await this.authService.loginCustomer({
      identifier: customer.mobile,
      password: '__admin_login_as_user__',
      customerOverride: customer,
    });

    return {
      success: true,
      data: {
        customer,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        isAdminSession: true,
        adminContext: {
          adminId: adminPayload.id,
          adminUsername: adminPayload.username,
        },
      },
    };
  }
}
