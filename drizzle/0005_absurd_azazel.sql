CREATE TABLE IF NOT EXISTS "upload_period" (
	"id" uuid PRIMARY KEY NOT NULL,
	"start_timestamp" timestamp NOT NULL,
	"end_timestamp" timestamp NOT NULL
);
