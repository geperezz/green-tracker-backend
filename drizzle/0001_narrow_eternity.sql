CREATE TABLE IF NOT EXISTS "criteria" (
	"index" integer,
	"subindex" integer NOT NULL,
	"english_name" text NOT NULL,
	"spanish_alias" text NOT NULL,
	"category_name" text NOT NULL,
	CONSTRAINT "criteria_index_subindex_pk" PRIMARY KEY("index","subindex"),
	CONSTRAINT "criteria_subindex_unique" UNIQUE("subindex"),
	CONSTRAINT "criteria_english_name_unique" UNIQUE("english_name"),
	CONSTRAINT "criteria_spanish_alias_unique" UNIQUE("spanish_alias")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "criteria" ADD CONSTRAINT "criteria_index_indicators_index_fk" FOREIGN KEY ("index") REFERENCES "public"."indicators"("index") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "indicators_english_name_idx" ON "criteria" ("index","english_name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "indicators_spanish_alias_idx" ON "criteria" ("index","spanish_alias");