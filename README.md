# Pixel Quests

A pixel-art quest tracker for a 6-year-old. Real-life tasks become monsters to defeat, coins buy
armor from a merchant, and parents approve real rewards. Next.js 16 (App Router, Cache Components),
React 19 with the React Compiler, Neon Postgres, and private Vercel Blob for proof photos.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server on :3000 |
| `pnpm check` | ESLint + BEM check + TypeScript + tests. `pnpm build` runs it first, so a failing check stops a deploy |
| `pnpm test` | Vitest (time/PHT, bedtime, schedules, streaks and shields, levels and badges) |
| `pnpm lint` / `pnpm lint:css` | ESLint (includes architecture rules) / BEM CSS check |
| `node --env-file=.env.local scripts/migrate.mjs` | Create or update tables (safe to re-run) |
| `node scripts/make-icons.mjs` | Regenerate the app icons from the slime sprite |

## Project structure

```
src/
  app/                  Routing only: thin pages, layout, route handlers, global tokens (globals.css)
  features/             One folder per product area
    parent/             Parent mode: PIN dialog, session cookie, "parents only" page
    bedtime/            Bedtime lock: sleepy screen after a set hour, settings, gate for kid pages
    notifications/      Web Push to parent phones and a child's tablet (service worker in public/sw.js)
    monsters/           Monster art and the list of monster kinds
    trophies/           Levels (XP), badges, and the monster collection ("Monster-dex")
    backup/             Weekly JSON backup of every table, plus a download button
    wardrobe/           Merchant shop, armor, capes, wands, pets, the dress-up character
    rewards/            Real-life treats she can ask for, and the parent's reward manager
    quests/             Quest board, monsters, streaks, quest manager, evidence photos
    summary/            Weekly summary, rest days, shareable picture
      components/       Client/UI components, one folder each: Foo/Foo.tsx + Foo/Foo.css
      server/           Database queries (import "server-only"); never imported by components
      data/             Static content: sprites, items, constants
      lib/              Feature-specific helpers
      actions.ts        Server Actions ("use server")
      types.ts          Types shared by components and server code
  shared/               Used by any feature, knows nothing about them
    ui/                 Design-system pieces: PixelButton, Panel, FormDialog, HpBar, ...
    lib/                css/cx, time (PHT), storage, images, pixel helpers
    audio/              Sound provider and the "tap to start" gate
    server/             db.ts
```

### Dependency order

```
shared  <-  parent  <-  bedtime, notifications, monsters, trophies, backup  <-  wardrobe, rewards  <-  quests  <-  summary
```

A feature may import from anything to its left, never to its right, and nothing imports from
`app/`. UI components never import `server/` modules (types are fine). ESLint enforces both
(`eslint.config.mjs`), so a wrong import fails `pnpm lint`.

There are no barrel (`index.ts`) files on purpose: they blur the server/client boundary.
Import the file you need by its `@/...` path.

## CSS: BEM

- One **block** per component, in a file next to it (`MonsterCard/MonsterCard.css` defines `.monster-card`).
- Elements are `block__element`, modifiers are `block--modifier` or `block__element--modifier`.
  Never nest elements (`a__b__c`).
- A selector never reaches into another block. To position a child block, put a **mix** class
  from the parent on it: `<PixelButton className="dialog__button">`.
- Reusable looks are shared blocks in `shared/ui` (`panel`, `pixel-button`, `hp-bar`...). Use
  `panelClass("raised")` and `cx(...)` to mix them in.
- Mobile first: base styles are for a ~375px phone, `@media (min-width: ...)` only adds.
- Spacing and control sizes use the `--space-*` and `--control-height` tokens (8pt grid).
- `pnpm lint:css` checks names, one block per file, and no cross-block selectors.

## React 19 notes

- Forms use `<form action>` with `useActionState` (see `shared/ui/FormDialog`). React resets
  uncontrolled fields after an action, so `FormDialog` hands the last submitted values back to
  its children for `defaultValue`.
- Optimistic UI uses `useOptimistic` inside transitions (renaming a monster).
- Context is read with `use()` and provided as `<Context value>`.
- The React Compiler is on (`reactCompiler: true`), so components do not use `useMemo`,
  `useCallback` or `memo`.
- Pages read cookies or the clock inside `<Suspense>` (Cache Components); `await connection()`
  marks code that must run at request time.

## Kids

Everything is per child (quests, coins, outfit, rewards, rest days, bedtime). A device plays as the child
in the `pq_child` cookie; a parent picks it in parent mode (`selectChild`). Server code takes an explicit
`childId` (from `getChildId()` in pages and actions, or looped over in cron routes).

## Schedulers

- Vercel cron (once a day each, free tier): `/api/cron/cleanup` (old photos, plus a Sunday backup) and
  `/api/cron/weekly-summary` (Sunday evening push).
- `/api/cron/tick` sends quest reminders to the child's tablet. Vercel's free cron cannot run that often, so
  `.github/workflows/tick.yml` calls it every 30 minutes (needs the `CRON_SECRET` repository secret).

## Database migrations

`node --env-file=.env.local scripts/migrate.mjs` is additive and safe while the previous release is live.
Run it with `--contract` only after the new release is deployed; that step drops the old single-child constraints.

## Bedtime and notifications

- Bedtime is stored in the `settings` table and read in Philippine time. Kid pages (`/`, `/shop`,
  `/treats`) are wrapped in `AwakeGate`; a signed-in parent always gets through, and kid-only
  Server Actions refuse while asleep.
- Reward requests call `notifyParents` inside `after()`. On iPhone, Web Push only works for the
  app added to the Home Screen: open Settings there and tap "Turn on".
- Subscriptions live in `push_subscriptions`; dead ones (404/410) are removed on the next send.

## Environment

Pulled from Vercel with `vercel env pull`: `DATABASE_URL` (Neon), `BLOB_READ_WRITE_TOKEN`,
`PARENT_PIN_HASH`, `SESSION_SECRET`, `CRON_SECRET`, and the Web Push keys
`NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`.
The PIN is stored only as a salted scrypt hash.
