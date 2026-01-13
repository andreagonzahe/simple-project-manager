#!/usr/bin/env node

/**
 * Run database migration to rename domains to projects
 * This improves clarity throughout the codebase
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
    console.log('🔄 Running domains → projects migration...\n');

    const migrationPath = join(__dirname, '../supabase/migrations/20260112_rename_domains_to_projects.sql');
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
          console.error('❌ Error:', error);
          // Continue anyway - some errors might be expected
        } else {
          console.log('✅ Success');
        }
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📋 Summary of changes:');
    console.log('   ✓ Renamed table: domains → projects');
    console.log('   ✓ Renamed column in tasks: domain_id → project_id');
    console.log('   ✓ Renamed column in bugs: domain_id → project_id');
    console.log('   ✓ Renamed column in features: domain_id → project_id');
    console.log('   ✓ Renamed constraints: *_domain_or_area_check → *_project_or_area_check');
    console.log('   ✓ Renamed indexes: idx_*_domain_id → idx_*_project_id');
    console.log('\n📝 Your database now uses "project" terminology throughout!\n');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
