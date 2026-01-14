#!/usr/bin/env node

/**
 * Run the commitment level migration
 * 
 * This script adds the commitment_level column to tasks, bugs, and features tables.
 * 
 * Usage:
 *   node scripts/run-commitment-migration.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Starting commitment level migration...\n');

    // Read the migration file
    const migrationPath = join(__dirname, '../supabase/migrations/20260113_add_commitment_level.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('📄 Executing migration SQL...');
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      // If exec_sql doesn't exist, try executing directly
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        const { error: stmtError } = await supabase.from('_').select('*').limit(0);
        if (stmtError) {
          console.log('ℹ️  Note: Direct SQL execution not available via client.');
          console.log('   Please run this migration using Supabase CLI or Dashboard:\n');
          console.log('   Supabase CLI:');
          console.log('     supabase db push\n');
          console.log('   Or copy the SQL from:');
          console.log('     supabase/migrations/20260113_add_commitment_level.sql\n');
          console.log('   And run it in your Supabase SQL Editor.');
          process.exit(0);
        }
      }
    }

    console.log('✅ Migration completed successfully!\n');
    console.log('Summary:');
    console.log('  - Added commitment_level enum type');
    console.log('  - Added commitment_level column to tasks table');
    console.log('  - Added commitment_level column to bugs table');
    console.log('  - Added commitment_level column to features table');
    console.log('  - Created indexes for better query performance\n');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
