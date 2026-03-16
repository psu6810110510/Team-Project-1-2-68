import fs from 'fs';

const servicePath = 'd:/Team-Project-1-2-68/our-web/backend/src/modules/users/user.service.ts';
const controllerPath = 'd:/Team-Project-1-2-68/our-web/backend/src/modules/users/user.controller.ts';

// 1. Fix user.service.ts
try {
    let content = fs.readFileSync(servicePath, 'utf8');
    
    const methodToAdd = `
  async deleteUser(id: string) {
    // 1. Delete Profile first to prevent Foreign Key restricts
    await this.profileRepo.delete({ user_id: id });
    
    // 2. Delete User
    const result = await this.userRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
    return { message: 'User deleted successfully' };
  }
`;

    // Append before the last closing bracket
    const lastIndex = content.lastIndexOf('}');
    content = content.substring(0, lastIndex) + methodToAdd + content.substring(lastIndex);
    fs.writeFileSync(servicePath, content, 'utf8');
    console.log('✅ Added deleteUser to user.service.ts');
} catch (err) {
    console.error('❌ Error fixing user.service.ts:', err);
}

// 2. Fix user.controller.ts
try {
    let content = fs.readFileSync(controllerPath, 'utf8');
    
    // Add UnauthorizedException to imports
    if (content.includes('UseGuards, Request') && !content.includes('UnauthorizedException')) {
        content = content.replace('UseGuards, Request', 'UseGuards, Request, UnauthorizedException');
    }

    const endpointToAdd = `
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteUser(@Request() req, @Param('id') id: string) {
    if (req.user.role !== 'ADMIN') {
      throw new UnauthorizedException('Only admins can delete users');
    }
    return await this.userService.deleteUser(id);
  }
`;

    const lastIndex = content.lastIndexOf('}');
    content = content.substring(0, lastIndex) + endpointToAdd + content.substring(lastIndex);
    fs.writeFileSync(controllerPath, content, 'utf8');
    console.log('✅ Added DELETE /users/:id to user.controller.ts');
} catch (err) {
    console.error('❌ Error fixing user.controller.ts:', err);
}
