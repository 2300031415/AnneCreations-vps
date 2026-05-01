import { Controller, Post, Get, Put, Body, HttpCode, HttpStatus, Req, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from '../users/services/customers.service';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { sendEmail } from '../../common/utils/email.utils';

function getCustomerPayload(req: any): any {
  const authHeader = req.headers?.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedException('Missing or invalid authorization header');
  }
  const token = authHeader.substring(7);
  try {
    const secret = process.env.JWT_SECRET || 'anne_creations_secret_key_2024';
    return jwt.verify(token, secret) as any;
  } catch (e) {
    throw new UnauthorizedException('Session expired or invalid token');
  }
}

@ApiTags('customers')
@Controller('customers')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly customersService: CustomersService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Customer Login' })
  login(@Body() loginDto: any) {
    return this.authService.loginCustomer({
      identifier: loginDto.identifier || loginDto.mobile || loginDto.email,
      password: loginDto.password,
    });
  }

  @Post('register')
  @ApiOperation({ summary: 'Customer Registration' })
  async register(@Body() registerDto: any) {
    await this.authService.assertVerifiedOtp(registerDto.mobile, registerDto.otp);
    const customer = await this.customersService.create({
      ...registerDto,
      mobileVerified: true,
    });

    // Send Welcome Email
    if (customer.email) {
      try {
        await sendEmail({
          to: customer.email,
          subject: 'Welcome to Anne Creations!',
          template: `
            <div style="font-family: Arial, sans-serif; color: #311807;">
              <h2 style="color: #ccd88f;">Hello ${customer.firstName}!</h2>
              <p>Welcome to <strong>Anne Creations</strong>. We are thrilled to have you as part of our community.</p>
              <p>You can now browse our exclusive collection of computer embroidery designs and manage your orders.</p>
              <br/>
              <p>Best regards,<br/>The Anne Creations Team</p>
            </div>
          `,
          data: { firstName: customer.firstName }
        });
      } catch (emailError) {
        console.error('Welcome email failed:', emailError);
      }
    }

    return this.authService.loginCustomer({
      identifier: registerDto.mobile,
      password: '__verified_registration__',
      customerOverride: customer.toObject ? customer.toObject() : customer,
    });
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP to mobile' })
  async sendOtp(@Body() body: any) {
    return this.authService.sendCustomerOtp(body.mobile);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP' })
  async verifyOtp(@Body() body: any) {
    return this.authService.verifyCustomerOtp(body.mobile, body.otp);
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get customer profile' })
  async getProfile(@Req() req: any) {
    const payload = getCustomerPayload(req);
    return this.customersService.findOne(payload.id);
  }

  @Put('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update customer profile' })
  async updateProfile(@Req() req: any, @Body() body: any) {
    const payload = getCustomerPayload(req);
    const updated = await this.customersService.update(payload.id, body);
    return { success: true, customer: updated };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout customer' })
  logout() {
    return { success: true, message: 'Logged out successfully' };
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh customer token' })
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token required');
    }

    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET || 'your_secret_key') as any;
    if (!payload?.id || !payload?.mobile) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const customer = await this.customersService.findByMobile(payload.mobile);
    if (!customer) {
      throw new UnauthorizedException('Customer not found');
    }

    return this.authService.loginCustomer({
      identifier: payload.mobile,
      password: '__refresh_token__',
      customerOverride: customer,
    });
  }

  @Post('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change customer password' })
  async changePassword(@Req() req: any, @Body() body: any) {
    const payload = getCustomerPayload(req);
    const customer = await this.customersService.findByMobile((await this.customersService.findOne(payload.id) as any).mobile);
    if (!customer) throw new UnauthorizedException('Customer not found');
    const isMatch = await bcrypt.compare(body.currentPassword, (customer as any).password);
    if (!isMatch) throw new UnauthorizedException('Current password incorrect');
    await this.customersService.update(payload.id, { password: body.newPassword });
    return { success: true, message: 'Password changed successfully' };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Forgot password (send reset link)' })
  async forgotPassword(@Body('identifier') identifier: string) {
    if (!identifier) {
      throw new BadRequestException('Mobile or Email is required');
    }

    const customer = await this.customersService.findByMobile(identifier) || 
                     await this.customersService.findByEmail(identifier);
    
    if (!customer) {
      // For security, don't reveal if user exists
      return { success: true, message: 'If account exists, reset instructions will be sent' };
    }

    if (!customer.email) {
      throw new BadRequestException('No email associated with this account. Please contact support.');
    }

    const resetToken = jwt.sign(
      { id: customer._id, type: 'reset_password' },
      process.env.JWT_SECRET || 'anne_creations_secret_key_2024',
      { expiresIn: '1h' }
    );

    const resetLink = `${process.env.FRONTEND_URL || 'http://lowcostfreedom.com'}/reset-password?token=${resetToken}`;

    try {
      await sendEmail({
        to: customer.email,
        subject: 'Reset Your Anne Creations Password',
        template: `
          <div style="font-family: Arial, sans-serif; color: #311807; max-width: 600px; margin: 0 auto; border: 1px solid #ccd88f; padding: 20px; border-radius: 10px;">
            <h2 style="color: #ccd88f; text-align: center;">Password Reset Request</h2>
            <p>Hello ${customer.firstName || 'Customer'},</p>
            <p>We received a request to reset your password for your Anne Creations account.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #ccd88f; color: #311807; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">Reset Password</a>
            </p>
            <p>This link will expire in 1 hour.</p>
            <p>If you did not request this, please ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #777;">Best regards,<br/>The Anne Creations Team</p>
          </div>
        `,
        data: { firstName: customer.firstName }
      });
    } catch (error) {
      console.error('Forgot password email failed:', error);
      throw new InternalServerErrorException('Failed to send reset email');
    }

    return { success: true, message: 'If account exists, reset instructions will be sent' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token' })
  async resetPassword(@Body() body: any) {
    const { token, newPassword } = body;
    if (!token || !newPassword) {
      throw new BadRequestException('Token and new password are required');
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'anne_creations_secret_key_2024') as any;
      if (payload.type !== 'reset_password') {
        throw new Error('Invalid token type');
      }

      const customer = await this.customersService.findOne(payload.id);
      if (!customer) {
        throw new UnauthorizedException('Customer not found');
      }

      await this.customersService.update(payload.id, { password: newPassword });
      
      return { success: true, message: 'Password reset successfully' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }
}
