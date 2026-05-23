import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminsService } from '../users/services/admins.service';
import { CustomersService } from '../users/services/customers.service';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp, OtpDocument } from './schemas/otp.schema';
import { sendOTP } from '../../common/utils/sms.utils';

@Injectable()
export class AuthService {
  constructor(
    private adminsService: AdminsService,
    private customersService: CustomersService,
    private jwtService: JwtService,
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
  ) {}


  async sendCustomerOtp(mobile: string) {
    const normalizedMobile = String(mobile || '').trim();
    if (!/^\d{10,15}$/.test(normalizedMobile)) {
      throw new BadRequestException('Valid mobile number is required');
    }

    // ✅ Check BEFORE sending OTP: if already registered, reject immediately
    const existingCustomer = await this.customersService.findByMobile(normalizedMobile);
    if (existingCustomer) {
      throw new ConflictException('Mobile number already registered. Please login instead.');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.otpModel.deleteMany({ mobile: normalizedMobile });
    await this.otpModel.create({
      mobile: normalizedMobile,
      code,
      status: 'pending',
      createdAt: new Date(),
    });

    console.log(`[OTP Sent] Mobile ${normalizedMobile}`);

    // Track SMS result but don't block user flow in dev
    await sendOTP(normalizedMobile, code);

    return { success: true, message: 'OTP sent successfully', expiresIn: 300 };
  }

  async verifyCustomerOtp(mobile: string, otp: string) {
    const normalizedMobile = String(mobile || '').trim();
    const normalizedOtp = String(otp || '').trim();

    if (!/^\d{10,15}$/.test(normalizedMobile)) {
      throw new BadRequestException('Valid mobile number is required');
    }

    if (!/^\d{6}$/.test(normalizedOtp)) {
      throw new BadRequestException('Valid 6-digit OTP is required');
    }

    const record = await this.otpModel.findOne({
      mobile: normalizedMobile,
      code: normalizedOtp,
      status: 'pending',
    });

    if (!record) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    record.status = 'verified';
    await record.save();

    return { success: true, message: 'OTP verified' };
  }

  async assertVerifiedOtp(mobile: string, otp: string) {
    const normalizedMobile = String(mobile || '').trim();
    const normalizedOtp = String(otp || '').trim();

    const record = await this.otpModel.findOne({
      mobile: normalizedMobile,
      code: normalizedOtp,
      status: 'verified',
    });

    if (!record) {
      throw new UnauthorizedException('OTP verification required');
    }

    await this.otpModel.deleteMany({ mobile: normalizedMobile });
  }

  async validateAdmin(username: string, pass: string): Promise<any> {
    const admin = await this.adminsService.findByUsernameOrEmail(username);
    if (admin && await bcrypt.compare(pass, admin.password)) {
      const { password, salt, ...result } = admin;
      return result;
    }
    return null;
  }

  async loginAdmin(admin: any) {
    const payload = { 
        id: admin._id || admin.id,
        username: admin.username, 
        email: admin.email,
        isAdmin: true 
    };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
      admin
    };
  }

  async loginCustomer(loginDto: any) {
    const { mobile, identifier, password, customerOverride } = loginDto;
    const loginIdentifier = identifier || mobile;
    
    if (!loginIdentifier || (!password && !customerOverride)) {
      throw new BadRequestException('Mobile number and password are required');
    }

    const customer = customerOverride || await this.customersService.findByMobileOrEmail(loginIdentifier);
    if (!customer) {
      throw new UnauthorizedException('Invalid mobile number or password');
    }

    if (!customerOverride) {
      const isMatch = await bcrypt.compare(password, customer.password);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid mobile number or password');
      }
    }

    if (customer.status === false) {
      throw new UnauthorizedException('Invalid mobile number or password');
    }

    const payload = { 
      id: customer._id, 
      mobile: customer.mobile,
      email: customer.email,
      name: `${customer.firstName} ${customer.lastName}`,
      isCustomer: true 
    };

    const { password: _, ...customerWithoutPassword } = customer;

    return {
      success: true,
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
      customer: customerWithoutPassword
    };
  }
}
