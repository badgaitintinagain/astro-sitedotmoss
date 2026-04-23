import { createClient } from '@libsql/client/web'; // ใช้เวอร์ชั่น web เพื่อเลี่ยง native binding
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// โหลดค่าจาก .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
const adminEmail = process.env.ADMIN_EMAIL || 'admin@sitedotmoss.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';

if (!url || !authToken) {
  console.error('Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required in .env.local');
  process.exit(1);
}

// ตัวเลือก fetch: fetch (มีมาให้ใน Node 18+)
const client = createClient({ url, authToken });

async function setupAdmin() {
  console.log('--- SYSTEM_AUTH_SETUP_HTTP_INITIATED ---');
  
  try {
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(adminPassword, salt);
    const userId = `admin-${Date.now()}`;

    console.log(`Target Email: ${adminEmail}`);
    
    const existing = await client.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [adminEmail]
    });

    if (existing.rows.length > 0) {
      console.log('Result: ADMIN_ALREADY_EXISTS. Updating password...');
      await client.execute({
        sql: 'UPDATE users SET password_hash = ? WHERE email = ?',
        args: [passwordHash, adminEmail]
      });
      console.log('Result: PASSWORD_UPDATED');
    } else {
      await client.execute({
        sql: 'INSERT INTO users (id, email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        args: [userId, adminEmail, 'System Admin', passwordHash, 'admin', Math.floor(Date.now() / 1000)]
      });
      console.log('Result: NEW_ADMIN_RECORD_CREATED');
    }

    console.log('--- OPERATION_COMPLETE ---');
  } catch (error) {
    console.error('--- ERROR_OCCURRED ---');
    console.error(error.message);
  } finally {
    process.exit(0);
  }
}

setupAdmin();
