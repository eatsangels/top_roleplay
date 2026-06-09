# TOP ROLEPLAY

Portal web y panel de administración para **TOP ROLEPLAY: Cops vs Gangs**, una ciudad persistente donde policías, bandas y civiles disputan territorios, reputación y poder.

La visión funcional del juego está documentada en [LoQueQuiero.md](./LoQueQuiero.md). La web presenta esa temática, muestra el estado público de la comunidad y permite administrar su contenido desde Supabase.

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Supabase

Para una instalación nueva, ejecuta los archivos SQL desde el editor de Supabase en este orden:

1. `supabase/top-roleplay-schema.sql`
2. `supabase/role-panels-security-migration.sql`
3. `supabase/sanctions-module-migration.sql`
4. `supabase/public-full-cms-migration.sql`
5. `supabase/cops-vs-gangs-theme-migration.sql`

La última migración adapta el contenido administrable a la temática final de Policía, Bandas, Civiles y Guerra de Territorios. Es idempotente y puede aplicarse nuevamente.

Si el proyecto ya tiene `top-roleplay-schema.sql` aplicado pero todavía no existen
`public.public_sections` o `public.public_content`, ejecuta solamente:

1. `supabase/public-full-cms-migration.sql`
2. `supabase/cops-vs-gangs-theme-migration.sql`

No vuelvas a ejecutar el esquema base en una base de datos existente, porque contiene
creaciones iniciales que no son idempotentes.

## Validación

```bash
npm run lint
npm run build
```
