DO $$ BEGIN
 CREATE TYPE "public"."user_role" AS ENUM('unit', 'admin', 'superadmin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"password" text NOT NULL,
	"role" "user_role" NOT NULL
);
