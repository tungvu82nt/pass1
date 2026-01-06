import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const { Client } = pg;

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function migrate() {
    try {
        console.log('⏳ Connecting to NeonDB for migration...');
        await client.connect();

        console.log('🔄 Executing migration schema...');

        // 1. Create Table
        await client.query(`
      CREATE TABLE IF NOT EXISTS passwords (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        service VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
        console.log('✅ Table "passwords" checked/created.');

        // 2. Create Indexes
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_passwords_service ON passwords(service);
      CREATE INDEX IF NOT EXISTS idx_passwords_username ON passwords(username);
      CREATE INDEX IF NOT EXISTS idx_passwords_updated_at ON passwords(updated_at DESC);
    `);
        console.log('✅ Indexes created.');

        // 3. Create Update Timestamp Function
        await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
        console.log('✅ Function "update_updated_at_column" created.');

        // 4. Create Trigger
        // Drop trigger if exists to avoid error on recreation or multiple triggers
        await client.query(`
      DROP TRIGGER IF EXISTS update_passwords_updated_at ON passwords;
      CREATE TRIGGER update_passwords_updated_at
          BEFORE UPDATE ON passwords
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `);
        console.log('✅ Trigger "update_passwords_updated_at" created.');

        console.log('🎉 Migration completed successfully!');

    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
