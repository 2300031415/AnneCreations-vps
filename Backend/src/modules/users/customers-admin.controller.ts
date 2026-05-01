import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomersService } from './services/customers.service';

@ApiTags('customers-admin')
@Controller('customers')
export class CustomersAdminController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'List customers for admin portal' })
  async findAll(@Query() query: any) {
    return this.customersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID for admin portal' })
  async findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create customer from admin portal' })
  async create(@Body() body: any) {
    return this.customersService.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update customer from admin portal' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.customersService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete customer from admin portal' })
  async remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}
