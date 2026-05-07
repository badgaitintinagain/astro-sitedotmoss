import { createClient } from '@libsql/client/web';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
const adminEmail = process.env.ADMIN_EMAIL || 'admin@sitedotmoss.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';

if (!url || !authToken) {
  console.error('Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required in .env.local');
  process.exit(1);
}

const turso = createClient({ url, authToken });

async function setupDatabase() {
  console.log('Setting up database...');

  try {
    const schemaPath = path.resolve(__dirname, '../src/lib/db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    const statements = schema
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      await turso.execute(statement);
    }

    console.log('Schema created.');

    const bcrypt = (await import('bcryptjs')).default;
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    const existingUser = await turso.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [adminEmail],
    });

    if (existingUser.rows.length > 0) {
      await turso.execute({
        sql: 'UPDATE users SET password_hash = ?, name = ?, role = ? WHERE email = ?',
        args: [passwordHash, 'Admin', 'admin', adminEmail],
      });
      console.log('Admin user password updated.');
    } else {
      const adminId = `admin-${Date.now()}`;
      await turso.execute({
        sql: 'INSERT INTO users (id, email, name, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        args: [adminId, adminEmail, 'Admin', passwordHash, 'admin'],
      });
      console.log('Admin user created.');
    }

    console.log('Setup complete.');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
