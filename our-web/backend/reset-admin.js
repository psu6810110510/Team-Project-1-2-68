const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    const adminEmail = 'admin@born2code.com';
    const newPassword = 'password123';
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Check if admin exists
    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (adminUser) {
      // Update password
      await prisma.user.update({
        where: { email: adminEmail },
        data: { password: hashedPassword }
      });
      console.log(`Successfully reset password for ${adminEmail} to '${newPassword}'`);
    } else {
      console.log(`Admin user with email ${adminEmail} not found!`);
      // Optionally create one
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          full_name: 'Administrator',
          role: 'ADMIN' // Default Prisma enum depends on schema, assuming ADMIN
        }
      });
      console.log(`Created new admin user with email ${adminEmail} and password '${newPassword}'`);
    }
    
  } catch (error) {
    console.error('Error resetting admin password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
