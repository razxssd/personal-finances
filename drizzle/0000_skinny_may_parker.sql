CREATE TABLE "exchange_rates" (
	"date" date NOT NULL,
	"from_currency" varchar(8) NOT NULL,
	"to_currency" varchar(8) NOT NULL,
	"rate" numeric(24, 12) NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exchange_rates_date_from_currency_to_currency_pk" PRIMARY KEY("date","from_currency","to_currency")
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"currency" varchar(8) DEFAULT 'EUR' NOT NULL,
	"tag" text NOT NULL,
	"source" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incomes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"currency" varchar(8) DEFAULT 'EUR' NOT NULL,
	"tag" text NOT NULL,
	"source" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "investments" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"month_year" varchar(7) NOT NULL,
	"value" numeric(18, 2) NOT NULL,
	"currency" varchar(8) DEFAULT 'EUR' NOT NULL,
	"tag" text NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "liquidity" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"month_year" varchar(7) NOT NULL,
	"value" numeric(18, 2) NOT NULL,
	"currency" varchar(8) DEFAULT 'EUR' NOT NULL,
	"tag" text NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"kind" varchar(20) NOT NULL,
	"color" varchar(16),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "expenses_user_date_idx" ON "expenses" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "expenses_user_tag_idx" ON "expenses" USING btree ("user_id","tag");--> statement-breakpoint
CREATE INDEX "incomes_user_date_idx" ON "incomes" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "incomes_user_tag_idx" ON "incomes" USING btree ("user_id","tag");--> statement-breakpoint
CREATE INDEX "investments_user_month_idx" ON "investments" USING btree ("user_id","month_year");--> statement-breakpoint
CREATE INDEX "investments_user_tag_idx" ON "investments" USING btree ("user_id","tag");--> statement-breakpoint
CREATE INDEX "liquidity_user_month_idx" ON "liquidity" USING btree ("user_id","month_year");--> statement-breakpoint
CREATE INDEX "liquidity_user_tag_idx" ON "liquidity" USING btree ("user_id","tag");--> statement-breakpoint
CREATE INDEX "tags_user_kind_idx" ON "tags" USING btree ("user_id","kind");