import { db, users } from '@/lib/db';
import { hashPassword } from '@/lib/auth/utils';

async function setupAdmin() {
  try {
    const adminEmail = 'admin@sitedotmoss.com';
    const adminPassword = 'changeme123';
    
    console.log('Creating admin user with bcrypt hashing...');
    
    const hashedPassword = await hashPassword(adminPassword);
    
    await db.insert(users).values({
      id: `admin-${Date.now()}`,
      email: adminEmail,
      name: 'Admin',
      passwordHash: hashedPassword,
      role: 'admin',
      avatar: null,
    });
    
    console.log('✅ Admin user created successfully');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('⚠️ IMPORTANT: Change the password immediately after first login!');
  } catch (error) {
    console.error('Failed to create admin user:', error);
  }
}

setupAdmin();
