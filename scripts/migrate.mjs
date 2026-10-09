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

// Expand: additive changes that the previous release of the app still works with.
const expand = [
  `CREATE TABLE IF NOT EXISTS children (
    id serial PRIMARY KEY,
    name text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `INSERT INTO children (id, name) SELECT 1, 'Hero' WHERE NOT EXISTS (SELECT 1 FROM children)`,
  `SELECT setval(pg_get_serial_sequence('children', 'id'), greatest((SELECT max(id) FROM children), 1))`,

  `ALTER TABLE quests ADD COLUMN IF NOT EXISTS child_id int NOT NULL DEFAULT 1 REFERENCES children(id)`,
  `ALTER TABLE quests ADD COLUMN IF NOT EXISTS days int NOT NULL DEFAULT 127`,
  `ALTER TABLE quests ADD COLUMN IF NOT EXISTS remind_at text`,
  `ALTER TABLE rewards ADD COLUMN IF NOT EXISTS child_id int NOT NULL DEFAULT 1 REFERENCES children(id)`,

  `ALTER TABLE wallet DROP CONSTRAINT IF EXISTS wallet_id_check`,
  `CREATE SEQUENCE IF NOT EXISTS wallet_id_seq START 2`,
  `ALTER TABLE wallet ALTER COLUMN id SET DEFAULT nextval('wallet_id_seq')`,
  `ALTER TABLE wallet ADD COLUMN IF NOT EXISTS child_id int NOT NULL DEFAULT 1 REFERENCES children(id)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS wallet_child_key ON wallet (child_id)`,

  `ALTER TABLE owned_items ADD COLUMN IF NOT EXISTS child_id int NOT NULL DEFAULT 1 REFERENCES children(id)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS owned_items_child_item_key ON owned_items (child_id, item_id)`,
  `ALTER TABLE equipped ADD COLUMN IF NOT EXISTS child_id int NOT NULL DEFAULT 1 REFERENCES children(id)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS equipped_child_slot_key ON equipped (child_id, slot)`,
  `ALTER TABLE rest_days ADD COLUMN IF NOT EXISTS child_id int NOT NULL DEFAULT 1 REFERENCES children(id)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS rest_days_child_day_key ON rest_days (child_id, day)`,
  `ALTER TABLE streak_bonuses ADD COLUMN IF NOT EXISTS child_id int NOT NULL DEFAULT 1 REFERENCES children(id)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS streak_bonuses_child_day_key ON streak_bonuses (child_id, day)`,
  `ALTER TABLE settings ADD COLUMN IF NOT EXISTS child_id int NOT NULL DEFAULT 0`,
  `CREATE UNIQUE INDEX IF NOT EXISTS settings_child_key_key ON settings (child_id, key)`,
  `ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'parent'`,
  `ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS child_id int`,

  `CREATE TABLE IF NOT EXISTS defeats (
    id bigserial PRIMARY KEY,
    child_id int NOT NULL REFERENCES children(id),
    quest_id text NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    period text NOT NULL,
    sprite text NOT NULL,
    cadence text NOT NULL,
    at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (quest_id, period)
  )`,
  `INSERT INTO defeats (child_id, quest_id, period, sprite, cadence, at)
   SELECT q.child_id, h.quest_id, h.period, q.sprite, q.cadence, max(h.created_at)
   FROM hits h JOIN quests q ON q.id = h.quest_id
   GROUP BY q.child_id, h.quest_id, h.period, q.sprite, q.cadence, q.max_hp
   HAVING count(*) >= q.max_hp
   ON CONFLICT DO NOTHING`,
  `CREATE TABLE IF NOT EXISTS perfect_days (
    child_id int NOT NULL REFERENCES children(id),
    day text NOT NULL,
    PRIMARY KEY (child_id, day)
  )`,
  `CREATE TABLE IF NOT EXISTS badges_earned (
    child_id int NOT NULL REFERENCES children(id),
    badge text NOT NULL,
    earned_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (child_id, badge)
  )`,
  `CREATE TABLE IF NOT EXISTS shield_purchases (
    id bigserial PRIMARY KEY,
    child_id int NOT NULL REFERENCES children(id),
    at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS claims (
    id bigserial PRIMARY KEY,
    child_id int NOT NULL REFERENCES children(id),
    quest_id text NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    period text NOT NULL,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'dismissed')),
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS claims_one_pending ON claims (quest_id, period) WHERE status = 'pending'`,
  `CREATE TABLE IF NOT EXISTS reminders_sent (
    quest_id text NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    day text NOT NULL,
    PRIMARY KEY (quest_id, day)
  )`,
];

// Contract: drops the old single-child constraints. Run with --contract only after the new
// release is live, because the previous release still relies on them.
const contract = [
  `ALTER TABLE equipped DROP CONSTRAINT IF EXISTS equipped_item_id_fkey`,
  `ALTER TABLE equipped DROP CONSTRAINT IF EXISTS equipped_pkey`,
  `DROP INDEX IF EXISTS equipped_child_slot_key`,
  `ALTER TABLE equipped ADD PRIMARY KEY (child_id, slot)`,
  `ALTER TABLE owned_items DROP CONSTRAINT IF EXISTS owned_items_pkey`,
  `DROP INDEX IF EXISTS owned_items_child_item_key`,
  `ALTER TABLE owned_items ADD PRIMARY KEY (child_id, item_id)`,
  `DO $$ BEGIN
     ALTER TABLE equipped ADD CONSTRAINT equipped_owned_fkey
       FOREIGN KEY (child_id, item_id) REFERENCES owned_items (child_id, item_id) ON DELETE CASCADE;
   EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `ALTER TABLE rest_days DROP CONSTRAINT IF EXISTS rest_days_pkey`,
  `DROP INDEX IF EXISTS rest_days_child_day_key`,
  `ALTER TABLE rest_days ADD PRIMARY KEY (child_id, day)`,
  `ALTER TABLE streak_bonuses DROP CONSTRAINT IF EXISTS streak_bonuses_pkey`,
  `DROP INDEX IF EXISTS streak_bonuses_child_day_key`,
  `ALTER TABLE streak_bonuses ADD PRIMARY KEY (child_id, day)`,
  `ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_pkey`,
  `DROP INDEX IF EXISTS settings_child_key_key`,
  `ALTER TABLE settings ADD PRIMARY KEY (child_id, key)`,
  `ALTER TABLE wallet DROP CONSTRAINT IF EXISTS wallet_pkey`,
  `DROP INDEX IF EXISTS wallet_child_key`,
  `ALTER TABLE wallet DROP COLUMN IF EXISTS id`,
  `ALTER TABLE wallet ADD PRIMARY KEY (child_id)`,
];

const all = process.argv.includes("--contract") ? [...statements, ...expand, ...contract] : [...statements, ...expand];
for (const statement of all) {
  await sql.query(statement);
}

const [{ count }] = await sql.query("SELECT count(*)::int AS count FROM quests");
console.log(`migrated; ${count} quests`);
