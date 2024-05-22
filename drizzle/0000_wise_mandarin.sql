CREATE TABLE IF NOT EXISTS "indicators" (
	"index" integer PRIMARY KEY NOT NULL,
	"english_name" text NOT NULL,
	"spanish_alias" text NOT NULL,
	CONSTRAINT "indicators_english_name_unique" UNIQUE("english_name"),
	CONSTRAINT "indicators_spanish_alias_unique" UNIQUE("spanish_alias")
);
