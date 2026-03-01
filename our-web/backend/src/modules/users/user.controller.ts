import { Controller, Get, Post, Body, Param, Put, Query } from '@nestjs/common';
import { UserService } from './user.service';
import type { CreateUserDto, UpdateUserDto } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    const user = await this.userService.createUser(dto);
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      message: 'User created successfully',
    };
  }

  @Get()
  async getAllUsers(@Query('limit') limit = 10, @Query('offset') offset = 0) {
    const [users, total] = await this.userService.getAllUsers(Number(limit), Number(offset));
    return {
      data: users.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        created_at: u.created_at,
      })),
      total,
      limit: Number(limit),
      offset: Number(offset),
    };
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    const profile = await this.userService.getUserProfile(id);
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      profile: profile || null,
    };
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.userService.updateUser(id, dto);
    const profile = await this.userService.getUserProfile(id);
    return {
      user: {
        id: user.id,
        email: user.email,
      },
      profile: profile || null,
      message: 'User updated successfully',
    };
  }
}
