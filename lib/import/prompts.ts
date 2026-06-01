const SNAPSHOT_RULES = [
  "Columns (in this exact order, comma-separated): month,value,currency,tag,note",
  "`month` format: YYYY-MM (e.g. 2026-01).",
  "`value`: positive decimal, dot as decimal separator (e.g. 1234.56). No currency symbol.",
  "`currency`: ISO code (EUR, USD, GBP, CHF, BTC, ETH, SOL, USDT, USDC). Default to EUR if unspecified.",
  "`tag`: short category label, free text.",
  "`note`: optional free text — leave empty if not provided.",
  "Wrap any field containing a comma in double quotes.",
  "First line must be the header exactly as above.",
  "Output ONLY the CSV, no commentary, no markdown fences.",
];

const TRANSACTION_RULES = [
  "Columns (in this exact order, comma-separated): date,amount,currency,tag,source,note",
  "`date` format: YYYY-MM-DD (e.g. 2026-03-15). If only the month is known, use the 1st (e.g. 2026-03-01).",
  "`amount`: positive decimal, dot as decimal separator. No currency symbol, no thousands separator.",
  "`currency`: ISO code (EUR, USD, GBP, CHF, BTC, ETH, SOL, USDT, USDC). Default to EUR if unspecified.",
  "`tag`: category label, free text.",
  "`source`: who/where the money came from or went to (e.g. Netflix, Employer, Iliad). Leave empty if not applicable.",
  "`note`: optional free text.",
  "Wrap any field containing a comma in double quotes.",
  "First line must be the header exactly as above.",
  "Output ONLY the CSV, no commentary, no markdown fences.",
];

function buildPrompt(intro: string, rules: string[], examples: string[]): string {
  return [
    intro,
    "",
    "Rules:",
    ...rules.map((r) => `- ${r}`),
    "",
    "Example output:",
    ...examples,
    "",
    "My items:",
    "<PASTE YOUR LIST HERE>",
  ].join("\n");
}

export const INVESTMENTS_PROMPT = buildPrompt(
  "Help me create a CSV file of monthly investment snapshots that I can import into my personal-finance app.",
  [
    ...SNAPSHOT_RULES,
    "Common tags: ETF, Stocks, Crypto, Crypto-Meme.",
  ],
  [
    "month,value,currency,tag,note",
    "2026-01,5000.00,EUR,ETF,VWCE Directa",
    "2026-01,1200.00,EUR,Crypto,BTC on Bitpanda",
    "2026-02,5150.00,EUR,ETF,VWCE Directa",
  ]
);

export const LIQUIDITY_PROMPT = buildPrompt(
  "Help me create a CSV file of monthly liquidity snapshots that I can import into my personal-finance app.",
  [
    ...SNAPSHOT_RULES,
    "Common tags: Cash, Online Banking, Benefits.",
  ],
  [
    "month,value,currency,tag,note",
    "2026-01,3000.00,EUR,Online Banking,Revolut + Postepay",
    "2026-01,500.00,EUR,Cash,Wallet",
    "2026-01,150.00,EUR,Benefits,Meal vouchers",
  ]
);

export const INCOME_PROMPT = buildPrompt(
  "Help me create a CSV file of income transactions that I can import into my personal-finance app.",
  [
    ...TRANSACTION_RULES,
    "Common tags: Salary, Freelance, Extra, Refunds.",
  ],
  [
    "date,amount,currency,tag,source,note",
    "2026-01-27,2500.00,EUR,Salary,Employer,",
    "2026-01-15,300.00,EUR,Freelance,Client X,Website",
  ]
);

export const EXPENSES_PROMPT = buildPrompt(
  "Help me create a CSV file of expense transactions that I can import into my personal-finance app.",
  [
    ...TRANSACTION_RULES,
    "Common tags: Fixed costs, Home, Home Invoices, Car expenses, Eating Out, Hang outs, Treats, Gifts, Barber, House Cleaning, Girlfriend, Breakfast or Coffee Offered, Travel, Health, Taxes, Work, Personal Growing, Investments, Other.",
  ],
  [
    "date,amount,currency,tag,source,note",
    "2026-01-01,770.00,EUR,Home,Rent,",
    "2026-01-15,228.50,EUR,Car expenses,Car loan,",
    "2026-01-20,45.00,EUR,Eating Out,Dinner,With friends",
  ]
);

export const NOTION_EXPENSES_PROMPT = buildPrompt(
  "Help me format a CSV that matches the Notion expenses export, so I can import it into my personal-finance app via the Notion importer.",
  [
    "Columns (in this exact order, comma-separated): Source,Amount,Category,Date,Month",
    "`Source`: short description of the expense (e.g. Netflix, Rent, Eating out with friends).",
    "`Amount`: prefixed with `$` and using `.` as decimal separator, comma as thousands separator (e.g. $1,234.56). Even if values are in EUR, keep the `$` prefix — the importer strips it.",
    "`Category`: one of the existing categories (Fixed costs, Home, Home Invoices, Car expenses, Eating Out, Hang outs, Treats, Gifts, Barber, House Cleaning, Girlfriend, Breakfast or Coffee Offered, Travel, Health, Taxes, Work, Personal Growing, Investments, Other).",
    "`Date` format: \"Month D, YYYY\" with full English month name (e.g. \"January 1, 2026\"). Wrap in double quotes because it contains a comma.",
    "`Month` format: \"Month - YYYY\" (e.g. \"January - 2026\"). No URL suffix needed.",
    "Wrap any field containing a comma in double quotes.",
    "First line must be the header exactly as above.",
    "Output ONLY the CSV, no commentary, no markdown fences.",
  ],
  [
    "Source,Amount,Category,Date,Month",
    "Netflix,$6.99,Fixed costs,\"January 1, 2026\",January - 2026",
    "Rent,$770.00,Home,\"January 1, 2026\",January - 2026",
    "Dinner out,$45.00,Eating Out,\"January 20, 2026\",January - 2026",
  ]
);
