// Creates tables and seeds the starter quests. Safe to re-run.
// Usage: node --env-file=.env.local scripts/migrate.mjs
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const statements = [
  `CREATE TABLE IF NOT EXISTS quests (
    id text PRIMARY KEY,
    title text NOT NULL,
    monster_name text NOT NULL,
    cadence text NOT NULL CHECK (cadence IN ('daily', 'weekly')),
    max_hp int NOT NULL CHECK (max_hp > 0),
    reward int NOT NULL DEFAULT 5,
    sprite text NOT NULL,
    position int NOT NULL DEFAULT 0,
    active boolean NOT NULL DEFAULT true
  )`,
  `CREATE TABLE IF NOT EXISTS hits (
    id bigserial PRIMARY KEY,
    quest_id text NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    period text NOT NULL,
    seq int NOT NULL,
    evidence_path text,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (quest_id, period, seq)
  )`,
  `CREATE TABLE IF NOT EXISTS wallet (
    id int PRIMARY KEY CHECK (id = 1),
    coins int NOT NULL DEFAULT 0
  )`,
  `INSERT INTO wallet (id, coins) VALUES (1, 0) ON CONFLICT DO NOTHING`,
  `CREATE TABLE IF NOT EXISTS pin_attempts (
    id bigserial PRIMARY KEY,
    at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS owned_items (
    item_id text PRIMARY KEY,
    bought_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS equipped (
    slot text PRIMARY KEY,
    item_id text NOT NULL REFERENCES owned_items(item_id) ON DELETE CASCADE
  )`,
  `ALTER TABLE quests ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now()`,
  `CREATE TABLE IF NOT EXISTS streak_bonuses (
    day text PRIMARY KEY,
    streak int NOT NULL,
    bonus int NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS rest_days (
    day text PRIMARY KEY
  )`,
  `CREATE TABLE IF NOT EXISTS rewards (
    id text PRIMARY KEY,
    title text NOT NULL,
    cost int NOT NULL CHECK (cost > 0),
    icon text NOT NULL,
    position int NOT NULL DEFAULT 0,
    active boolean NOT NULL DEFAULT true
  )`,
  `CREATE TABLE IF NOT EXISTS reward_requests (
    id bigserial PRIMARY KEY,
    reward_id text NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
    title text NOT NULL,
    cost int NOT NULL,
    status text NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'approved', 'denied', 'cancelled')),
    created_at timestamptz NOT NULL DEFAULT now(),
    resolved_at timestamptz
  )`,
  `CREATE TABLE IF NOT EXISTS settings (
    key text PRIMARY KEY,
    value jsonb NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS push_subscriptions (
    endpoint text PRIMARY KEY,
    p256dh text NOT NULL,
    auth text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `INSERT INTO quests (id, title, monster_name, cadence, max_hp, reward, sprite, position) VALUES
    ('teeth', 'Brush Teeth', 'Gloop', 'daily', 2, 5, 'slime', 1),
    ('reading', 'Read a Story', 'Blip', 'daily', 1, 5, 'slime', 2),
    ('tidy', 'Tidy Room Boss', 'Grumbo', 'weekly', 5, 25, 'gremlin', 3)
   ON CONFLICT DO NOTHING`,
];

for (const statement of statements) {
  await sql.query(statement);
}

const [{ count }] = await sql.query("SELECT count(*)::int AS count FROM quests");
console.log(`migrated; ${count} quests`);
