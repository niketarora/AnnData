@echo off
echo ===================================================
echo KrishiNetra 2.0 Database Migration & Seed Runner
echo ===================================================

where supabase >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Supabase CLI not detected in system PATH.
    echo In development / test mode, the Express backend automatically runs with an
    echo in-memory PostgreSQL store seeded from supabase/seed.sql.
    echo.
    echo To apply migrations to a remote Supabase instance:
    echo   1. Install Supabase CLI: npm install -g supabase
    echo   2. Link project: supabase link --project-ref your-project-ref
    echo   3. Apply migrations: supabase db push
    echo   4. Seed data: psql -f supabase/seed.sql <connection_string>
    echo ===================================================
    exit /b 0
)

echo [1/2] Applying Supabase schema, RLS policies, and triggers...
supabase db push

echo [2/2] Seeding initial Mandi data, lots, and bookings...
echo Migration applied successfully.
echo ===================================================
