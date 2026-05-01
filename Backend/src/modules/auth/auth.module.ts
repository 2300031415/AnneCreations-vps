import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AdminAuthController } from './admin-auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { Otp, OtpSchema } from './schemas/otp.schema';
import { BlacklistedToken, BlacklistedTokenSchema } from './schemas/blacklisted-token.schema';
import { RequestSignature, RequestSignatureSchema } from './schemas/request-signature.schema';
import { CustomersService } from '../users/services/customers.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Otp.name, schema: OtpSchema },
      { name: BlacklistedToken.name, schema: BlacklistedTokenSchema },
      { name: RequestSignature.name, schema: RequestSignatureSchema },
    ]),
    forwardRef(() => UsersModule),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your_secret_key',
        signOptions: { expiresIn: '30d' },
      }),
    }),
  ],
  controllers: [AuthController, AdminAuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
