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

function notionRules(sourceHint: string, categories: string[]): string[] {
  return [
    "Columns (in this exact order, comma-separated): Source,Amount,Category,Date,Month",
    `\`Source\`: ${sourceHint}`,
    "`Amount`: prefixed with `$` and using `.` as decimal separator, comma as thousands separator (e.g. $1,234.56). Even if values are in EUR, keep the `$` prefix — the importer strips it.",
    `\`Category\`: one of the existing categories (${categories.join(", ")}).`,
    '`Date` format: "Month D, YYYY" with full English month name (e.g. "January 1, 2026"). Wrap in double quotes because it contains a comma.',
    '`Month` format: "Month - YYYY" (e.g. "January - 2026"). No URL suffix needed.',
    "Wrap any field containing a comma in double quotes.",
    "First line must be the header exactly as above.",
    "Output ONLY the CSV, no commentary, no markdown fences.",
  ];
}

export const NOTION_EXPENSES_PROMPT = buildPrompt(
  "Help me format a CSV that matches the Notion expenses export, so I can import it into my personal-finance app via the Notion importer.",
  notionRules(
    "short description of the expense (e.g. Netflix, Rent, Eating out with friends).",
    [
      "Fixed costs",
      "Home",
      "Home Invoices",
      "Car expenses",
      "Eating Out",
      "Hang outs",
      "Treats",
      "Gifts",
      "Barber",
      "House Cleaning",
      "Girlfriend",
      "Breakfast or Coffee Offered",
      "Travel",
      "Health",
      "Taxes",
      "Work",
      "Personal Growing",
      "Investments",
      "Other",
    ]
  ),
  [
    "Source,Amount,Category,Date,Month",
    'Netflix,$6.99,Fixed costs,"January 1, 2026",January - 2026',
    'Rent,$770.00,Home,"January 1, 2026",January - 2026',
    'Dinner out,$45.00,Eating Out,"January 20, 2026",January - 2026',
  ]
);

export const NOTION_INCOME_PROMPT = buildPrompt(
  "Help me format a CSV that matches the Notion income export, so I can import it into my personal-finance app via the Notion importer.",
  notionRules(
    "where the money came from (e.g. Stipendio, Extra +, Rimborso Luca, Client X).",
    ["Salary", "Freelance", "Extra", "Parents", "DEBT", "State", "Investments"]
  ),
  [
    "Source,Amount,Category,Date,Month",
    'Stipendio,"$3,616.00",Salary,"January 1, 2026",January - 2026',
    'Rimborso Luca,$150.00,DEBT,"January 1, 2026",January - 2026',
    'Client X,$900.00,Freelance,"January 20, 2026",January - 2026',
  ]
);
