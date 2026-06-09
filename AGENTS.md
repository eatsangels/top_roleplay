<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# TOP ROLEPLAY Project Guide

## Product Direction

TOP ROLEPLAY is a Cops vs Gangs roleplay portal and admin panel. The public site must feel like a living city where police, gangs, civilians, territories, raids, contraband, reputation and community stories matter.

Use `LoQueQuiero.md` as the gameplay/theme source of truth when adapting content, labels, navigation, visuals or CMS copy. Avoid returning to the old pirate-only language unless a specific asset or legacy database key requires it.

Core public theme:

- Brand: `TOP ROLEPLAY`
- Setting: urban Cops vs Gangs city
- Factions: Police, gangs, civilians, informants, transporters and merchants
- Systems: dynamic territories, wanted/arrests, raids, prison breaks, contraband, faction progression, economy and community roleplay

## Stack

- Next.js `16.2.7` App Router with Turbopack
- React `19.2.4`
- Supabase Auth, Postgres and RLS
- Tailwind CSS v4
- Lucide icons

Before changing Next-specific behavior, read the relevant file in `node_modules/next/dist/docs/`. The local docs are more reliable than assumptions from older Next versions.

## Local Commands

```bash
npm run dev
npm run lint
npm run build
```

Run `npm run lint` and `npm run build` after meaningful code changes.

## Important App Routes

- `/` public landing page
- `/login` player login
- `/registro` player registration
- `/cuenta` player account page
- `/admin/login` admin login
- `/admin` admin router/entry
- `/admin/panel/[role]` role-specific admin dashboard
- `/admin/nuevo/[module]` create records
- `/admin/editar/[module]/[id]` edit records

Do not recreate `/register`; this app uses Spanish routes such as `/registro`.

## Supabase Migrations

For a new Supabase project, apply SQL files in this order:

1. `supabase/top-roleplay-schema.sql`
2. `supabase/role-panels-security-migration.sql`
3. `supabase/sanctions-module-migration.sql`
4. `supabase/player-support-rls-migration.sql`
5. `supabase/support-attachments-migration.sql`
6. `supabase/public-full-cms-migration.sql`
7. `supabase/cops-vs-gangs-theme-migration.sql`

For an existing project that already has the base schema but is missing the public CMS tables, apply only:

1. `supabase/public-full-cms-migration.sql`
2. `supabase/cops-vs-gangs-theme-migration.sql`

For an existing project that already has the base schema but is missing web support/report uploads, apply:

1. `supabase/player-support-rls-migration.sql`
2. `supabase/support-attachments-migration.sql`

Do not rerun `top-roleplay-schema.sql` blindly on an existing database. It is the base schema, while the later files are safer migrations for existing projects.

If Supabase says a table is missing from the schema cache, run the relevant migration and then ensure `notify pgrst, 'reload schema';` has executed.

## Auth And Roles

Admin roles are stored in `public.admin_roles`.

Supported roles:

- `super_admin`
- `admin`
- `moderator`
- `editor`
- `support`

Role panels and module permissions live in `src/lib/admin-data.ts`.

Rules:

- `super_admin` has full control, including staff roles and settings.
- `admin` can manage core gameplay/public content modules but not staff roles.
- `moderator` can access moderation modules, sanctions, players, characters, logs and GM reference.
- `editor` manages public content: news, events, gallery and CMS.
- `support` handles tickets and reports.

The account `alexandertrinidad@gmail.com` has been treated as the intended super admin during development. Do not hardcode admin-only UI based on email in new code; use `admin_roles` and the existing bootstrap/admin role flow.

## Admin Panel Data

The admin panel should use real Supabase data, not hardcoded dashboard content.

Key files:

- `src/lib/admin-live-data.ts`: loads dashboard stats, charts and module records from Supabase.
- `src/lib/admin-forms.ts`: defines create/edit forms and table mapping.
- `src/lib/admin-data.ts`: role panels, navigation and permissions.
- `src/app/api/admin/*`: admin mutations, status changes, settings and staff role APIs.

When adding a new admin module:

1. Add permissions in `moduleRoles` and `moduleWriteRoles`.
2. Add navigation if it should appear in the panel.
3. Add live data mapping in `admin-live-data.ts`.
4. Add form config in `admin-forms.ts` if records can be created/edited.
5. Add or update Supabase schema/RLS migration.

## Player Support And Reports

Players can open tickets and report other players from `/cuenta` in the `Centro de soporte` section.

Key files:

- `src/app/cuenta/page.tsx`: authenticated account page, support forms, upload input and player-owned support history.
- `src/app/api/support/create/route.ts`: authenticated POST endpoint that creates tickets/reports and uploads optional evidence files.
- `src/lib/admin-live-data.ts`: maps `reports` and `tickets` into staff/admin modules.
- `src/app/api/admin/record-status/route.ts`: lets staff change report/ticket status.
- `supabase/player-support-rls-migration.sql`: lets authenticated players read/create their own support records through RLS.
- `supabase/support-attachments-migration.sql`: creates the private `support-attachments` Storage bucket and `public.support_attachments` metadata table.

Support data lives in:

- `public.reports`
- `public.tickets`
- `public.ticket_messages`
- `public.support_attachments`
- Supabase Storage bucket `support-attachments`

Rules:

- Tickets are for help requests, bugs, account issues and gameplay support.
- Reports are for player misconduct and require a valid reported player username.
- The API must always derive `player_id` from the authenticated user; never trust a posted player ID.
- Players cannot report themselves.
- Optional evidence uploads are private and limited to 10MB.
- Allowed evidence types are PNG, JPG, WEBP, GIF, PDF, TXT, MP4 and MOV.
- Staff verification happens in the existing admin modules `Reportes` and `Tickets`.
- Support/admin roles can change statuses; do not expose staff-only notes or privileged actions to players.
- If `support_attachments` is missing, the API may still upload to Storage and append the Storage path to the ticket/report text, but the migration should be applied for durable metadata and RLS.

## Public CMS

The public site is CMS-driven through:

- `public.public_sections`
- `public.public_content`
- `public.site_settings`
- `public.news`
- `public.events`
- `public.gallery`
- `public.downloads`

Use `supabase/public-full-cms-migration.sql` to install the public CMS tables and seed content. Use `supabase/cops-vs-gangs-theme-migration.sql` to adapt public content, nav and events to the Cops vs Gangs theme.

Keep public labels aligned with the final theme:

- `Mundo` can become `Ciudad`
- `Sistemas` can become `Conflicto`
- `Eventos` can become `Operaciones`
- `Descargas` can become `Jugar`

## GM Module

The GM option is a reference/manual inside the admin panel. It must not execute commands against a live game server from the web app.

Key files:

- `src/lib/gm-commands.ts`
- `src/components/admin/gm-command-reference.tsx`
- `src/app/admin/panel/[role]/page.tsx`

Current GM catalog includes:

- 53 verified GameServer 1.36/1.38 command names using `&`
- 8 verified GroupServer 1.38 command names using `@@`
- community/build-specific aliases marked as variants
- reference tables for jobs, character attributes and pet attributes
- operational recipes for common GM flows

Important command syntax captured from the supplied TOP guide:

- `&addexp <number>`
- `&addkb <number>` for inventory slots
- `&addmoney <number>`
- `&addsailexp <number>`
- `&call <CharName>`
- `&goto <CharName>`
- `&hide`
- `&unhide`
- `&move <x>,<y>,<mapname>`
- `&make <item_id>,<quantity>[,<gem_config>]`
- `&skill <SkillID>,<SkillLevel>`
- `&qcha "<CharName>"`
- `&attr <attribute_id>,<value>[,<character_id>]`
- `&itemattr 2,1,<pet_attribute_id>,<amount>`
- `&summon <monster_id>`
- `&notice <text>`
- `&kick <CharName>`

GM safety rules:

- Treat syntax as build-dependent even when the command name is verified.
- Keep dangerous commands marked as high or critical risk.
- Never present web UI controls as if they execute GM commands.
- Keep contradictions explicit. The provided guide conflicts on `51` and `52` for ACC/AGI, so the panel marks those as delicate.
- Use moderate examples; avoid encouraging extreme values in production.

Primary GM sources:

- `https://github.com/V3ct0r1024/pkodev.tool.editgmcmd`
- `https://github.com/V3ct0r1024/pkodev.tool.editgmcmd/blob/master/db/pkodev.tool.editgmcmd.json`

## Visual Direction

The public site should be modern, immersive and adapted to TOP ROLEPLAY. Current visual direction includes:

- dark cinematic city mood
- gold/red/cyan accents
- parallax sections
- TOP ROLEPLAY SVG/logo assets
- favicon/app icons generated from the TOP visual identity
- video asset in `public/Logo_reveal_animation_TOP_ROLEPLAY_202606061133.mp4`

Avoid adding generic fantasy/pirate copy when the requested direction is Cops vs Gangs.

## Common Pitfalls

- Hydration errors can be caused by browser extensions that modify HTML. Do not assume all hydration warnings are app bugs, but still check for dynamic SSR/client mismatches.
- `/cuenta` must exist because successful player login can redirect there.
- `/registro` uses API-backed registration now; avoid Server Actions for cross-origin/devtunnel registration forms because they previously caused invalid Server Actions requests.
- The home/nav must show the logged-in state outside the admin panel too.
- Public CMS tables may be missing in older databases; handle missing optional tables gracefully and point to the correct migration.

## Editing Rules

- Keep edits scoped.
- Preserve existing user changes.
- Prefer existing patterns and helpers.
- Use Supabase RLS and role checks instead of client-only permission assumptions.
- Use Spanish UI copy unless the surrounding file is intentionally English.
- Run lint/build after implementation changes.
