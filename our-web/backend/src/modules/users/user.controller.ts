import { Controller, Get, Post, Body, Param, Put, Query, Delete, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import type { CreateUserDto, UpdateUserDto } from './user.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

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

  @UseGuards(JwtAuthGuard)
  @Get('dashboard/stats')
  async getDashboardStats() {
    return await this.userService.getDashboardStats();
  }

  @Get()
  async getAllUsers(
    @Query('limit') limit = 100,
    @Query('offset') offset = 0,
    @Query('role') role?: string,
  ) {
    const [users, total] = await this.userService.getAllUsers(
      Number(limit),
      Number(offset),
      role,
    );
    return {
      data: users.map((u) => ({
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        role: u.role,
        is_active: u.is_active,
        phone: u.phone,
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

  // Favorite courses endpoints
  @UseGuards(JwtAuthGuard)
  @Get('me/favorites')
  async getMyFavorites(@Request() req) {
    const userId = req.user.sub;
    return await this.userService.getUserFavorites(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':courseId/favorite')
  async addFavorite(@Request() req, @Param('courseId') courseId: string) {
    const userId = req.user.sub;
    return await this.userService.addFavoriteCourse(userId, courseId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':courseId/favorite')
  async removeFavorite(@Request() req, @Param('courseId') courseId: string) {
    const userId = req.user.sub;
    return await this.userService.removeFavoriteCourse(userId, courseId);
  }
}
