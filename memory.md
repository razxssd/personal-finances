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

### Un solo parser Notion per Expenses e Income
I due database Notion esportano le stesse colonne (`Source,Amount,Category,Date,Month`, piu` un `Year` che si ignora), quindi `parseNotionTransactionsCsv` serve entrambi: cambia solo la tabella di destinazione (`expenses` vs `incomes`) e il `kind` dei tag creati. Le categorie income di Eduard sono Salary, Extra, Parents, DEBT, Investments, State, Freelance — restano as-is accanto ai preset italiani (Stipendio, Rimborsi), coerente con la regola "import faithful".

## Tema

- **`next-themes`** gestisce il tema: `defaultTheme="dark"`, `enableSystem`.
- **Toggle** (`ThemeToggle`) nell'header dell'`AppShell`: ciclo dark → light → system → dark con icona Moon/Sun/Monitor.
- **Clerk sign-in/up** stays dark sempre (`appearance.variables.colorScheme: 'dark'`) — meno friction per cambiare stile sul provider statico.
- **Recharts neutrals**: tick fill `#94a3b8` (slate-400), total line stroke `#64748b` (slate-500) — leggibili su entrambi i temi.

## Layout desktop

- `AppShell` main widens from `max-w-2xl` (mobile) to `max-w-6xl` at `md+` (768px+).
- Pages use `grid-cols-1 lg:grid-cols-2` (1024px+) to render charts and lists side-by-side on wide screens.
- Mobile single-column flow is preserved — `lg:` breakpoint chosen so iPad portrait (768) still gets single col, only laptops/desktops trigger multi-col.

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

### Income ed expenses entrano solo da Notion (2026-09-05)
Le card generiche "Income — transactions" e "Expenses — transactions" sono state rimosse su
richiesta di Eduard, con tutta la catena che le serviva: le server action `importIncomesCsv` /
`importExpensesCsv` (erano endpoint pubblici, non solo UI), `parseTransactionCsv`, i prompt
`INCOME_PROMPT` / `EXPENSES_PROMPT` e i template `income.csv` / `expenses.csv`. Restano i due
importer Notion. `parseSnapshotCsv` invece resta: investments e liquidity non hanno un export
Notion e continuano a passare dal CSV generico.

### Notion export (esistente)
Header originale: `Source,Amount,Category,Date,Month` — parser dedicato in `lib/import/notion.ts`.

## Sicurezza

- Repo pubblico → **mai** committare `.env.local`, dump DB, screenshot con dati reali.
- `.env.example` con keys vuote come reference.
- Clerk middleware redirect chiunque non sia `capanueduard98@gmail.com`.

## Import dedup

- L'import server action filtra le righe già presenti tramite **chiave naturale**:
  - **Snapshot** (investments, liquidity): `(monthYear, tag, value, currency)`.
  - **Transazioni** (income, expense, Notion expense): `(date, amount, tag, source)`.
- Anche i duplicati *all'interno dello stesso CSV* sono filtrati (set `seen`).
- Il toast finale mostra `N imported · M duplicates skipped · K invalid`.
- Implicazioni: se per caso hai due cene da 30€ nella stessa data con stesso tag/source, la seconda sarà considerata duplicato. Edge case raro ma noto. Workaround: aggiungi note o source diverse, oppure inserisci manualmente.

## Form touch su iOS — bug e fix (2026-08-09)

Segnalazione: aprendo il form "Add investment" da iPhone, i tap sui campi non facevano nulla e al secondo tap il foglio si chiudeva. Due cause distinte, entrambe verificate in WebKit con emulazione iPhone (Playwright):

1. **Popup portalati fuori dal drawer.** Vaul è un dialog modale Radix → mentre il drawer è aperto `document.body` ha `pointer-events: none`. Tag combobox (Base UI Popover) e Currency (Base UI Select) si portalavano su `<body>`, quindi risultavano `pointer-events: none`: visibili ma non toccabili, e il tap attraversava fino a ciò che stava sotto (overlay → drawer chiuso). Misurato: `computedPointerEvents: "none"`, `elementFromPoint` restituiva l'elemento *sotto* il popup. Fix: `PopupContainerProvider` in `BottomSheet` passa il nodo del drawer come `container` del portal; `usePopupContainer()` in `ui/popover.tsx` e `ui/select.tsx`. Dopo il fix: `pointer-events: auto`, `insideDrawer: true`, selezione funzionante.
2. **Doppia gestione della tastiera.** `useVisualViewport` applicava `translateY(-altezzaTastiera)` sul drawer, ma vaul riposiziona già da sé (`repositionInputs`, default true) **e** legge il `transform` del drawer (`getTranslate`) per calcolare lo swipe — quindi il nostro transform veniva letto come una trascinata di 336px. Con tastiera simulata il foglio finiva a `top: -137` (fuori schermo). Fix: hook rimosso, gestione lasciata a vaul.

Note: il percorso desktop (Base UI `Dialog`) non era toccato e resta invariato — `body.pointer-events` lì è vuoto. Aggiunto `data-vaul-no-drag` sui popup così lo scroll interno non trascina il foglio. Con il popup dentro il drawer, il tasto Esc chiude anche il drawer (nessuna tastiera fisica su iPhone, ininfluente in pratica).

## Form touch su iOS, parte 2 — la PWA (2026-08-21)

Segnalazione: dal browser i form "funzionano male ma almeno le dropdown si aprono"; dalla
PWA (aggiungi a Home) i campi della liquidity non si riescono a selezionare. Il fix del
2026-08-09 aveva risolto l'interattività (portal dentro il drawer), non l'**ergonomia**:
restava tutto grande la metà di un bersaglio touch.

Cause, in ordine di peso:

1. **I controlli erano da 32px, non 44.** Il preset shadcn usato (base-nova) è denso da
   desktop: `input` `h-8`, `select-trigger` `h-8`, `button` default `h-8`, righe di
   select `py-1` (~28px), righe del combobox `py-1.5` (~30px), campo di ricerca `h-8!`.
   Il CLAUDE.md chiedeva ≥44pt da sempre: nessun primitive lo rispettava.
2. **Lo zoom era disabilitato** (`maximumScale: 1`, `userScalable: false`). Safari come
   browser ignora quel meta (accessibilità), una PWA standalone no: nel browser Eduard
   pizzicava per centrare un bersaglio da 32px, installata non poteva più. È esattamente
   la differenza che ha segnalato. Rimosso: con tutti i campi a 16px non serviva.
3. **Il foglio non scrollava.** `DrawerContent` era `h-auto` + `max-h-[80vh]` senza
   scroller interno: con la tastiera aperta i campi sotto la piega erano irraggiungibili
   (e trascinare il foglio = dismiss). Ora il corpo è `flex-1 overflow-y-auto min-h-0`,
   il foglio `max-h-[85dvh]`.
4. **Niente safe-area in fondo al foglio.** In standalone il foglio arriva al bordo
   fisico: gli ultimi ~34px sono la zona della home indicator, dove il sistema si prende
   lo swipe. Il bottone Save cadeva lì. Aggiunto `env(safe-area-inset-bottom)`.
5. **Select dentro il foglio**: `alignItemWithTrigger` (default true) stendeva la lista
   sopra il trigger; nel foglio finiva schiacciata. Dentro un drawer ora è false.

Verificato in WebKit con touch a 428×926 (iPhone 12 Pro Max) su una route probe temporanea
sotto `/sign-in-dev-forms` (pubblica per il matcher del middleware, poi cancellata):
tutti i controlli ≥44px e ≥16px, ognuno topmost al proprio centro, popup del select
`pointer-events: auto` e interamente in viewport, scelta valuta e tag funzionanti,
e con viewport schiacciato a 428×560 (tastiera simulata) il corpo scrolla e Save resta
raggiungibile. Desktop ricontrollato a 1280: tutto torna a 32/36/40px, Dialog centrato,
portal su body, `alignItemWithTrigger` true. Script: `Lupy/tmp/pf-touch/`.

Nota: `size="sm"`/`"xs"`/`"icon-sm"`/`"icon-xs"` dei bottoni sono lasciati compatti di
proposito (chip in liste dense). Se un giorno un bersaglio `sm` sta in un form, va
promosso a `default`, non rimpicciolito il pavimento.

## TODO / decisioni rimaste aperte

- [ ] Provisioning Neon e Clerk su Vercel Marketplace (richiede browser, l'utente lo fa).
- [ ] Custom domain (es. `finanze.razxssd.dev`)? Per ora `*.vercel.app` va bene.
- [ ] Backup automatico DB (Neon free fa snapshot? Verificare).
- [ ] PWA installabile completa (manifest + icons): facoltativo per la prima release.
