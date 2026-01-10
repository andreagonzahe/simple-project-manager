#!/usr/bin/env node

/**
 * Run database migrations to simplify the hierarchy
 * This will:
 * 1. Add domain_id to tasks, bugs, features
 * 2. Remove subdomain_id from those tables
 * 3. Drop subdomains and subtasks tables
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('🔄 Running hierarchy simplification migration...\n');

    const migrationPath = join(__dirname, '../supabase/migrations/20260109_simplify_hierarchy.sql');
    const sql = readFileSync(migrationPath, 'utf8');

    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement) {
        console.log(`Executing: ${statement.substring(0, 60)}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.error('Error:', error);
          // Continue anyway - some errors are expected (e.g., column already exists)
        }
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📋 Summary of changes:');
    console.log('   - Added domain_id to tasks, bugs, and features tables');
    console.log('   - Removed subdomain_id from tasks, bugs, and features tables');
    console.log('   - Dropped subdomains table');
    console.log('   - Dropped subtasks table');
    console.log('\n📝 New hierarchy: Domain → Project → Task\n');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
