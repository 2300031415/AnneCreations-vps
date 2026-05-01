import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesService } from './roles.service';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'List roles' })
  async findAll(@Query() query: any) {
    const result = await this.rolesService.findAll(query);
    return {
      success: true,
      data: result.roles,
      pagination: result.pagination,
    };
  }

  @Get('features')
  @ApiOperation({ summary: 'Get role features' })
  async getFeatures() {
    return {
      success: true,
      data: {
        features: await this.rolesService.getFeatures(),
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID' })
  async findOne(@Param('id') id: string) {
    return {
      success: true,
      data: await this.rolesService.findOne(id),
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create role' })
  async create(@Body() body: any) {
    return {
      success: true,
      data: await this.rolesService.create(body),
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update role' })
  async update(@Param('id') id: string, @Body() body: any) {
    return {
      success: true,
      data: await this.rolesService.update(id, body),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role' })
  async remove(@Param('id') id: string) {
    await this.rolesService.remove(id);
    return {
      success: true,
      message: 'Role deleted successfully',
    };
  }

  @Get(':id/admins')
  @ApiOperation({ summary: 'Get admins assigned to a role' })
  async getRoleAdmins(@Param('id') id: string) {
    return {
      success: true,
      data: {
        admins: await this.rolesService.getRoleAdmins(id),
      },
    };
  }
}
