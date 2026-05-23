# Personal Finances

App personale (mobile-first) per tracciare patrimonio (investimenti + liquidità) e cashflow (entrate/uscite). Sostituisce un workflow Notion.

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind v4 · shadcn/ui · Drizzle ORM · Neon Postgres · Clerk · Recharts · Vaul

## Setup locale

1. Provisiona le risorse su [Vercel](https://vercel.com):
   - **Neon Postgres** dal Marketplace (free tier 0.5 GB)
   - **Clerk** dal Marketplace (free fino a 10K MAU)
2. Linka il progetto:
   ```bash
   vercel link
   vercel env pull .env.local
   ```
3. Configura `ALLOWED_EMAIL=capanueduard98@gmail.com` su Vercel.
4. Installa e fai il push dello schema:
   ```bash
   npm install
   npx drizzle-kit push
   ```
5. Avvia dev:
   ```bash
   npm run dev
   ```

## Comandi

| Comando | Cosa fa |
|---|---|
| `npm run dev` | Dev server su :3000 |
| `npm run build` | Build prod |
| `npm run start` | Avvia il build |
| `npx drizzle-kit push` | Sincronizza schema con Neon |
| `npx drizzle-kit studio` | UI per il DB |

## Struttura

- `app/` — Routes (`/`, `/patrimonio`, `/cashflow`, `/import`, `/settings`).
- `components/` — UI (charts, forms, layout, shadcn primitives).
- `lib/db/` — Schema Drizzle, queries.
- `lib/import/` — Parser CSV (incluso Notion).
- `lib/fx.ts` — Conversione multi-valuta (exchangerate.host + CoinGecko).
- `lib/actions.ts` — Server Actions per CRUD.

Vedi [`CLAUDE.md`](./CLAUDE.md) e [`memory.md`](./memory.md) per contesto, decisioni e edge case.

## Import dati storici

Tre modi:

1. **Notion export diretto** — alla pagina `/import` carica direttamente il CSV `Expenses…_all.csv` esportato da Notion. Il parser strippa `$`, gestisce date mancanti, e mappa le categorie.
2. **CSV generici** — scarica i template da `/import` (investments, liquidity, income, expenses) e compilali manualmente.
3. **UI a riga** — usa i form via bottom sheet dal mobile.

## Mobile UX

- Bottom navigation fissa con safe-area-inset.
- Forms in bottom sheet (vaul) con gestione tastiera iOS via `visualViewport`.
- Tap target ≥ 44pt, font input ≥ 16px (evita zoom iOS).
- Grafici sempre responsive, max 7-8 punti su mobile.
- PWA installabile (manifest + theme-color).

## Privacy

Repo pubblico, dati privati. Solo `ALLOWED_EMAIL` (Clerk allowlist) può accedere. Nessun `.env.local` committato — usa `vercel env pull`.
