// Migration: Add 'images' column to posts table
// Run with: node scripts/add-images-column.js

import '../dotenv-config.js';
import { createClient } from '@libsql/client/web';

async function migrate() {
  console.log('🔄 Adding images column to posts table...\n');

  const turso = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  try {
    // Check if column already exists by trying to query it
    try {
      await turso.execute('SELECT images FROM posts LIMIT 1');
      console.log('✅ Column "images" already exists. No migration needed.');
      return;
    } catch {
      // Column doesn't exist yet - proceed with migration
    }

    await turso.execute('ALTER TABLE posts ADD COLUMN images TEXT');
    console.log('✅ Added "images" column to posts table successfully!');
    console.log('\n💡 Existing posts will have images = null (falls back to cover_image).\n');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
