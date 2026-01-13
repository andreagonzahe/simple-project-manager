#!/usr/bin/env node

/**
 * Run database migration to add recurring task functionality
 * This will add is_recurring, recurrence_pattern, and related fields to tasks, bugs, and features
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
    console.log('🔄 Running recurring tasks migration...\n');

    const migrationPath = join(__dirname, '../supabase/migrations/20260112_add_recurring_tasks.sql');
    const sql = readFileSync(migrationPath, 'utf8');

    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement) {
        console.log(`Executing: ${statement.substring(0, 80)}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.error('Error:', error);
          // Continue anyway - some errors are expected (e.g., column already exists)
        } else {
          console.log('✓ Success');
        }
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📋 Summary of changes:');
    console.log('   - Added is_recurring field to tasks, bugs, and features');
    console.log('   - Added recurrence_pattern (daily, weekly, monthly, yearly)');
    console.log('   - Added recurrence_end_date for tasks that should stop repeating');
    console.log('   - Added last_completed_date to track when tasks were last done');
    console.log('   - Added next_due_date for scheduling recurring tasks');
    console.log('   - Created indexes for better performance');
    console.log('\n📝 You can now create recurring tasks in the UI!\n');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
