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

- **Tema:** `next-themes` con `defaultTheme="dark"`, `enableSystem`, toggle ciclico (dark → light → system → dark) nell'header dell'`AppShell`. Clerk sign-in resta forzato dark via `appearance.variables.colorScheme`.
- **Lingua UI:** inglese. **Codice/identifiers/comments:** inglese.
- **Currency display:** EUR di default, `Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' })`.
- **Date display:** `format(date, 'MMM yyyy')` (default English locale).
- **Mobile-first:** progetta per iPhone 12 Pro Max (428×926). Tap target ≥ 44pt, input font ≥ 16px (evita zoom iOS).
- **Desktop responsive:** `AppShell` cresce a `max-w-6xl` da `md` (768px+). Pagine usano `grid-cols-1 lg:grid-cols-2` (1024px+) per affiancare chart/lista. Mobile resta single-column.
- **Form di entry responsive:** `Drawer` (vaul) dal bottom su mobile (< 768px); `Dialog` centrato `sm:max-w-md` su desktop. Il wrapper `BottomSheet` decide in base a `useIsDesktop`.
- **Numeric input:** `inputMode="decimal"` + `pattern="[0-9]*[.,]?[0-9]*"` per il keypad iOS.

## Struttura directory

```
app/
  layout.tsx                  # Root layout (Clerk provider, theme, toaster)
  page.tsx                    # Home dashboard
  wealth/page.tsx             # Investments + liquidity snapshots
  cashflow/page.tsx           # Income + expenses
  import/page.tsx             # Import/export + CSV templates
  settings/page.tsx           # Tag management, allowlist
  sign-in/[[...sign-in]]/page.tsx
  sign-up/[[...sign-up]]/page.tsx
components/
  ui/                         # shadcn primitives — regenerate, don't restyle by hand.
                              # Exception: the mobile-first touch sizing (`h-11 md:h-8`)
                              # and the portal `container` are hand-carried, see Mobile UX.
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
    notion.ts                 # Notion expenses + income parser (see memory.md for rules)
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

1. Form via `BottomSheet` wrapper — Drawer su mobile, Dialog centrato su desktop (breakpoint 768px).
2. **Tastiera iOS: non gestirla a mano.** Vaul riposiziona già il drawer da sé (`repositionInputs`, default true) e legge il `transform` del drawer per capire lo swipe: scrivere un nostro `transform` sopra spostava il foglio fuori posizione e falsava il drag. (Un hook `useVisualViewport` faceva esattamente questo — rimosso 2026-08-09.)
3. **Popup dentro il Drawer: `container` obbligatorio.** Vaul è un dialog modale Radix, quindi mentre il drawer è aperto il `<body>` ha `pointer-events: none`. Un Popover/Select portalato su `<body>` risulta visibile ma non toccabile, e il tap attraversa fino all'overlay che chiude il drawer. `BottomSheet` espone il nodo del drawer via `PopupContainerProvider` e `ui/popover.tsx` + `ui/select.tsx` lo leggono con `usePopupContainer()`. Ogni nuovo primitive con portal deve fare lo stesso, più `data-vaul-no-drag` sul popup perché lo scroll interno non trascini il foglio.
4. **Il pavimento 44pt/16px vive nei primitives, non nelle pagine.** `input`, `textarea`,
   `select-trigger`, `select-item`, `command-input`, `command-item` e `button` (size
   `default`/`icon`) sono mobile-first: misura touch alla base, compatta da `md:`. Più un
   blocco `@media (pointer: coarse)` in fondo a `globals.css`, **fuori da ogni `@layer`**
   così batte le utility di Tailwind: forza 16px sui campi e `touch-action: manipulation`
   sui bersagli. Non rimettere `style={{ fontSize: "16px" }}` sui singoli campi — è
   ridondante e nasconde il difetto nel primitive.
5. **Lo zoom resta abilitato** (`viewport` senza `maximumScale`/`userScalable`). In
   standalone non c'è chrome del browser da cui pizzicare per raggiungere un controllo
   troppo piccolo, e con i campi a 16px iOS non ha motivo di zoomare al focus.
6. **Il corpo del bottom sheet è lo scroller**, non il foglio. Con la tastiera aperta il
   foglio è basso: un campo sotto la piega si raggiunge scrollando: trascinare il foglio
   vaul lo legge come dismiss. `BottomSheet` mette `flex-1 overflow-y-auto min-h-0` sul
   corpo e tiene header e footer fermi; il `DrawerContent` usa `max-h-[85dvh]` (non `vh`)
   e `padding-bottom: env(safe-area-inset-bottom)` per stare sopra la home indicator.
7. **Select dentro un sheet: `alignItemWithTrigger` va a false.** Il default di Base UI
   stende la lista sopra il trigger per allineare l'item selezionato; in un foglio la
   schiaccia contro i bordi. `ui/select.tsx` lo decide da sé: `alignItemWithTrigger ?? !container`.
8. Bottom nav con `padding-bottom: env(safe-area-inset-bottom)`.
9. Grafici: max 7-8 data points visibili, paginazione per anno/quarter.
10. Nessuno scroll orizzontale.
11. PWA: `manifest.json`, `apple-touch-icon`, theme-color.

## Comandi utili

```bash
npm run dev                 # Next dev su :3000
npm run build               # Build prod
npx drizzle-kit generate    # Genera migration
npx drizzle-kit push        # Push schema a Neon (dev)
npx drizzle-kit studio      # GUI per il DB
```

## Da non fare

- ❌ Non usare `Dialog` centrato per i form di inserimento su mobile (usa `BottomSheet` wrapper che fa lo switch automatico).
- ❌ Non hardcodare valori in EUR — sempre `currency` esplicita nel record.
- ❌ Non "normalizzare" i tag durante l'import Notion — preserva le inconsistenze, espone tool di merge a parte.
- ❌ Non mettere secrets in `NEXT_PUBLIC_*` env vars.
- ❌ Non mettere il deploy a Vercel in CI senza che l'utente prima abbia provisionato Neon e Clerk via Marketplace.

## File correlati

- `memory.md` — log decisioni di prodotto, edge case, formati CSV.
- `AGENTS.md` — istruzioni dal template Next.js (non-essential).
