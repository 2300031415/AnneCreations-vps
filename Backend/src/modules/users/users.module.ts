import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminsService } from './services/admins.service';
import { CustomersService } from './services/customers.service';
import { UsersController } from './users.controller';
import { CustomersAdminController } from './customers-admin.controller';
import { AdminsAdminController } from './admins-admin.controller';
import { Admin, AdminSchema } from './schemas/admin.schema';
import { Customer, CustomerSchema } from './schemas/customer.schema';
import { OnlineUser, OnlineUserSchema } from './schemas/online-user.schema';
import { UserActivity, UserActivitySchema } from './schemas/user-activity.schema';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { RolesModule } from '../roles/roles.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: OnlineUser.name, schema: OnlineUserSchema },
      { name: UserActivity.name, schema: UserActivitySchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    RolesModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController, CustomersAdminController, AdminsAdminController],
  providers: [AdminsService, CustomersService],
  exports: [AdminsService, CustomersService, MongooseModule],
})
export class UsersModule {}
