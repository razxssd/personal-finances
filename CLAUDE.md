# Personal Finances — Project Context for Claude

App personale di Eduard per tracciare patrimonio (investimenti + liquidità) e cashflow (entrate/uscite). Sostituisce un workflow Notion. Repo pubblico, dati privati.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** + **Turbopack**
- **Tailwind v4** (CSS variables) + **shadcn/ui** (preset base-nova, base color neutral)
- **Drizzle ORM** + **@neondatabase/serverless** (Postgres su Neon free tier)
- **Clerk** (`@clerk/nextjs`) per auth — email allowlist a `capanueduard98@gmail.com`
- **Zod** per validazione (forms + import)
- **react-hook-form** per i form (no shadcn `form` wrapper, non disponibile nel registry usato)
- **Recharts** per i grafici (sempre dentro `ResponsiveContainer`)
- **Vaul** per i bottom sheet su mobile (mai `Dialog` centrale per i form di inserimento)
- **date-fns** + locale `it`
- **papaparse** per import CSV
- **sonner** per i toast

## Convenzioni

- **Lingua UI:** italiano. **Codice/identifiers/comments:** inglese.
- **Currency display:** EUR di default, `Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })`.
- **Date display:** `format(date, 'MMM yyyy', { locale: it })` o equivalente.
- **Mobile-first:** progetta per iPhone 12 Pro Max (428×926). Tap target ≥ 44pt, input font ≥ 16px (evita zoom iOS).
- **Niente modal centrati** per i form di entry — solo `Drawer` (vaul) dal bottom.
- **Numeric input:** `inputMode="decimal"` + `pattern="[0-9]*[.,]?[0-9]*"` per il keypad iOS.

## Struttura directory

```
app/
  layout.tsx                  # Root layout (Clerk provider, theme, toaster)
  page.tsx                    # Home dashboard
  patrimonio/page.tsx         # Snapshots investimenti + liquidità
  cashflow/page.tsx           # Income + expenses
  import/page.tsx             # Import/export + CSV templates
  settings/page.tsx           # Tag management, allowlist
  sign-in/[[...sign-in]]/page.tsx
  sign-up/[[...sign-up]]/page.tsx
components/
  ui/                         # shadcn primitives (don't edit by hand)
  charts/                     # Recharts wrappers
  forms/                      # Form components (each in BottomSheet)
  layout/                     # BottomNav, AppShell, KeyboardAware
lib/
  db/
    schema.ts                 # Drizzle table defs
    index.ts                  # Drizzle client (Neon HTTP)
    queries.ts                # Reusable queries
  schemas.ts                  # Zod schemas (forms + import)
  import/
    csv.ts                    # Generic CSV parsers
    notion.ts                 # Notion expenses parser (see memory.md for rules)
  fx.ts                       # Currency conversion (exchangerate.host + CoinGecko)
  format.ts                   # EUR + IT date formatters
  tags.ts                     # Preset tags per kind
  utils.ts                    # cn() etc.
drizzle/                      # Generated migrations
public/
  templates/                  # CSV templates for import
```

## Tag preset

**Investments:** ETF, Azioni, Crypto, Crypto-Meme
**Liquidity:** Cash, Online Banking, Benefits
**Income:** Stipendio, Freelance, Extra, Rimborsi
**Expenses** (dedotti dal Notion CSV di Eduard):
  Fixed costs, Home, Home Invoices, Car expenses, Eating Out, Hang outs,
  Treats, Gifts, Barber, House Cleaning, Girlfriend, Breakfast or Coffee Offered,
  Travel, Health, Taxes, Work, Personal Growing, Investments, Other

L'utente può creare tag custom on-the-fly da qualsiasi combobox di tag.

## Auth

- Clerk gestisce sign-in/up.
- Middleware controlla che l'email Clerk sia `capanueduard98@gmail.com`, altrimenti redirect.
- Database query: `userId = auth().userId` — ogni tabella ha `userId` colonna text col Clerk userId.

## Currency

- Salva sempre in valuta originale + flag `currency`.
- `lib/fx.ts` converte a EUR per display.
- Rates fiat: exchangerate.host (no key). Crypto: CoinGecko free (no key).
- Cache in tabella `exchange_rates` (daily).

## Mobile UX (vincoli forti)

1. Form sempre in `Drawer` (vaul) con snap point e drag handle.
2. `useVisualViewport` hook per spostare il form quando si apre la tastiera iOS.
3. Bottom nav con `padding-bottom: env(safe-area-inset-bottom)`.
4. Grafici: max 7-8 data points visibili, paginazione per anno/quarter.
5. Nessuno scroll orizzontale.
6. PWA: `manifest.json`, `apple-touch-icon`, theme-color.

## Comandi utili

```bash
npm run dev                 # Next dev su :3000
npm run build               # Build prod
npx drizzle-kit generate    # Genera migration
npx drizzle-kit push        # Push schema a Neon (dev)
npx drizzle-kit studio      # GUI per il DB
```

## Da non fare

- ❌ Non usare `Dialog` centrato per i form di inserimento.
- ❌ Non hardcodare valori in EUR — sempre `currency` esplicita nel record.
- ❌ Non "normalizzare" i tag durante l'import Notion — preserva le inconsistenze, espone tool di merge a parte.
- ❌ Non mettere secrets in `NEXT_PUBLIC_*` env vars.
- ❌ Non mettere il deploy a Vercel in CI senza che l'utente prima abbia provisionato Neon e Clerk via Marketplace.

## File correlati

- `memory.md` — log decisioni di prodotto, edge case, formati CSV.
- `AGENTS.md` — istruzioni dal template Next.js (non-essential).
