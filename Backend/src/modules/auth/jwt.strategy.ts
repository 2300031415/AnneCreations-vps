import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from '../users/schemas/customer.schema';
import { Admin, AdminDocument } from '../users/schemas/admin.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your_secret_key',
    });
  }

  async validate(payload: any) {
    if (payload.type === 'customer') {
      const customer = await this.customerModel.findById(payload.id);
      if (customer && customer.status) {
        return { id: payload.id, type: 'customer' };
      }
    } else if (payload.type === 'admin') {
      const admin = await this.adminModel.findById(payload.id);
      if (admin && admin.status) {
        return { id: payload.id, type: 'admin', role: admin.role };
      }
    }
    throw new UnauthorizedException('Invalid or expired token');
  }
}
