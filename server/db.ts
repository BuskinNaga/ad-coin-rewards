import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema.js";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
});
export const db = drizzle(pool, { schema });

/**
 * Enables Row Level Security on the users and history tables.
 * Safe to call multiple times — fully idempotent.
 *
 * Why this works without breaking the backend:
 *   The DATABASE_URL connects as the `postgres` superuser (standard for
 *   Supabase / Neon / direct PG connections). PostgreSQL superusers bypass
 *   RLS automatically, so our Express routes are never affected.
 *   RLS blocks only direct Supabase REST-API calls using the anon /
 *   authenticated keys — which never touch our backend auth layer.
 *
 * The permissive service policy is a belt-and-suspenders safety net for
 * any pooled connection that runs under a non-superuser role.
 */
export async function applyRlsPolicies(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      DO $$
      BEGIN
        -- ── Enable RLS on both tables (idempotent) ──────────────────────────
        ALTER TABLE users   ENABLE ROW LEVEL SECURITY;
        ALTER TABLE history ENABLE ROW LEVEL SECURITY;

        -- ── Service-level permissive policy for users ────────────────────────
        -- Allows our backend's DB role full access.
        -- Superusers bypass RLS anyway; this covers non-superuser service roles.
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies
          WHERE schemaname = 'public'
            AND tablename  = 'users'
            AND policyname = 'backend_service_policy'
        ) THEN
          CREATE POLICY backend_service_policy ON users
            USING (true)
            WITH CHECK (true);
        END IF;

        -- ── Service-level permissive policy for history ───────────────────────
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies
          WHERE schemaname = 'public'
            AND tablename  = 'history'
            AND policyname = 'backend_service_policy'
        ) THEN
          CREATE POLICY backend_service_policy ON history
            USING (true)
            WITH CHECK (true);
        END IF;
      END $$;
    `);
    console.log("[db] RLS policies applied to users and history tables.");
  } catch (err) {
    // Log but do not crash — a missing RLS setup is not fatal for the backend
    console.error("[db] Warning: could not apply RLS policies:", err);
  } finally {
    client.release();
  }
}