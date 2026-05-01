import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { AdminsService } from './services/admins.service';
import { CustomersService } from './services/customers.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly customersService: CustomersService,
  ) {}

  // Admins
  @Get('admins')
  @ApiOperation({ summary: 'List all admins' })
  async findAdmins(@Query() query: any) {
    return this.adminsService.findAll(query);
  }

  @Post('admins')
  @ApiOperation({ summary: 'Create an admin' })
  async createAdmin(@Body() adminData: any) {
    return this.adminsService.create(adminData);
  }

  // Customers
  @Get('customers')
  @ApiOperation({ summary: 'List all customers' })
  async findCustomers(@Query() query: any) {
    return this.customersService.findAll(query);
  }

  @Get('customers/:id')
  @ApiOperation({ summary: 'Get customer by ID' })
  async findCustomer(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Post('customers')
  @ApiOperation({ summary: 'Register a customer' })
  async createCustomer(@Body() customerData: any) {
    return this.customersService.create(customerData);
  }
}
