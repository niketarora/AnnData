const fs = require('fs');
const path = require('path');

const base = path.join(__dirname, '..', 'supabase');
const files = [
  'migrations/20260908000001_initial_schema.sql',
  'migrations/20260908000002_rls_policies.sql',
  'migrations/20260908000003_functions_and_triggers.sql',
  'migrations/20260908000004_intelligence_engine.sql',
  'seed.sql'
];

let combined = '-- ============================================================\n' +
  '-- KrishiNetra 2.0 Complete Consolidated Database Setup\n' +
  '-- Run this in the Supabase Dashboard SQL Editor\n' +
  '-- Total: 33 Relational Tables, RLS Policies, Functions, & Seed Data\n' +
  '-- ============================================================\n\n';

for (const f of files) {
  const filePath = path.join(base, f);
  const content = fs.readFileSync(filePath, 'utf8');
  combined += '\n\n-- ============================================================\n' +
    '-- SECTION: ' + f + '\n' +
    '-- ============================================================\n\n' +
    content + '\n';
}

const outPath = path.join(base, 'complete_setup.sql');
fs.writeFileSync(outPath, combined, 'utf8');
console.log('Successfully generated ' + outPath + ' (length: ' + combined.length + ' bytes)');
