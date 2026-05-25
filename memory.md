# Project Memory — Decisions Log & Edge Cases

Decisioni di prodotto, edge case, e preferenze utente raccolte durante lo sviluppo. Questo file è leggibile da Claude come contesto persistente. Aggiornarlo quando una decisione cambia.

---

## Identità & deploy

- **GitHub user:** `razxssd` (account personale di Eduard, NON `rebrandly`).
- **Email primaria:** `capanueduard98@gmail.com`.
- **Repo:** pubblico su `github.com/razxssd/personal-finances` (TBD nome esatto).
- **Deploy:** Vercel, account collegato a GitHub `razxssd`.
- **Provisioning piano:**
  1. Neon Postgres via Vercel Marketplace (free tier, 0.5 GB).
  2. Clerk via Vercel Marketplace (free fino a 10K MAU).
  3. Env vars iniettate automaticamente nel progetto Vercel.

## Decisioni di prodotto

### Multi-device + multi-currency
- L'utente ha scelto sync multi-device → uso Neon + Clerk (non più local-first IndexedDB).
- L'utente ha scelto conversione automatica multi-valuta → `lib/fx.ts` con caching daily.

### Investments come categoria di spesa
Nel Notion di Eduard, "Investimenti" (PAC, Forex, ecc.) sono tracciati come voce di spesa mensile. Questo è il **contributo mensile**, distinto dal **valore totale del patrimonio investito**.

Soluzione:
- In `expenses` table c'è il tag `Investments` per il contributo mensile (cashflow view).
- In `investments` table c'è il valore totale snapshot (patrimonio view).
- Nella UI Cashflow → toggle "Escludi Investments dalle spese reali" per chi vuole vedere il vero spending.

### Tag inconsistenti nel Notion
Stesso item categorizzato diversamente nei mesi (es. "Affitto" → Home o Home Invoices; "Wifi" → Fixed costs o Home Invoices).

**Decisione:** import faithful (preserva l'inconsistenza). Tool di "merge tags" nelle settings permette di consolidare a posteriori.

### Valuta nel CSV Notion
Importi prefissati con `$` ma sono EUR (pattern italiani: Affitto, GYM, Iliad). Lo strip del `$` e l'assegnazione `currency: 'EUR'` è hardcoded nel parser Notion.

### Date mancanti nel CSV Notion
Le righe Apr/May 2026 hanno `Date` vuoto. Il parser usa la colonna `Month` ("April - 2026") e fa fallback al primo giorno del mese.

### URL Notion nel campo Month
Il `Month` ha sempre suffisso ` (https://www.notion.so/...)`. Il parser lo strippa.

## Tema

- **`next-themes`** gestisce il tema: `defaultTheme="dark"`, `enableSystem`.
- **Toggle** (`ThemeToggle`) nell'header dell'`AppShell`: ciclo dark → light → system → dark con icona Moon/Sun/Monitor.
- **Clerk sign-in/up** stays dark sempre (`appearance.variables.colorScheme: 'dark'`) — meno friction per cambiare stile sul provider statico.
- **Recharts neutrals**: tick fill `#94a3b8` (slate-400), total line stroke `#64748b` (slate-500) — leggibili su entrambi i temi.

## Vincoli UX (non negoziabili)

- iPhone 12 Pro Max è il device di riferimento.
- Form via `BottomSheet` wrapper responsive — `Drawer` (vaul) su mobile (< 768px), `Dialog` centrato `sm:max-w-md` su desktop. Reason: un drawer full-height su monitor 27" è eccessivo; mobile resta con bottom sheet.
- `useVisualViewport` per gestire la tastiera iOS senza scroll glitch.
- `inputMode="decimal"` su tutti gli input numerici.
- Bottom navigation fissa con safe-area-inset-bottom.
- Charts: `ResponsiveContainer` sempre, max 7-8 data points visibili su mobile.
- Niente scroll orizzontale.

## Language

- UI copy: **English** (switched from Italian on 2026-05-25).
- Codice, identifier, type, commenti: **English** (unchanged).
- Tag (es. "Fixed costs", "Eating Out", "Affitto", "Iliad"): preservati as-is in mix EN/IT — sono dati storici dal Notion, non UI.
- Date e numeri: locale `en-US`, currency EUR.
- Route names: english (`/wealth`, `/cashflow`, `/import`, `/settings`).

## Tag preset

### Investments
- ETF
- Azioni
- Crypto
- Crypto-Meme

### Liquidity
- Cash
- Online Banking
- Benefits

### Income
- Stipendio
- Freelance
- Extra
- Rimborsi

### Expenses (dal Notion CSV reale)
- Fixed costs
- Home
- Home Invoices
- Car expenses
- Eating Out
- Hang outs
- Treats
- Gifts
- Barber
- House Cleaning
- Girlfriend
- Breakfast or Coffee Offered
- Travel
- Health
- Taxes
- Work
- Personal Growing
- Investments  *(contributo mensile, escludibile da grafici "spese reali")*
- Other

## Formato CSV per import storico

### `templates/investments.csv` e `liquidity.csv`
```
month,value,currency,tag,note
2024-01,5000.00,EUR,ETF,VWCE
2024-01,1200.00,EUR,Crypto,BTC
2024-02,5150.00,EUR,ETF,VWCE
```

### `templates/income.csv` e `expenses.csv`
```
date,amount,currency,tag,note
2024-01-15,2500.00,EUR,Stipendio,
2024-01-20,45.00,EUR,Eating Out,Cena con amici
```

### Notion export (esistente)
Header originale: `Source,Amount,Category,Date,Month` — parser dedicato in `lib/import/notion.ts`.

## Sicurezza

- Repo pubblico → **mai** committare `.env.local`, dump DB, screenshot con dati reali.
- `.env.example` con keys vuote come reference.
- Clerk middleware redirect chiunque non sia `capanueduard98@gmail.com`.

## TODO / decisioni rimaste aperte

- [ ] Provisioning Neon e Clerk su Vercel Marketplace (richiede browser, l'utente lo fa).
- [ ] Custom domain (es. `finanze.razxssd.dev`)? Per ora `*.vercel.app` va bene.
- [ ] Backup automatico DB (Neon free fa snapshot? Verificare).
- [ ] PWA installabile completa (manifest + icons): facoltativo per la prima release.
