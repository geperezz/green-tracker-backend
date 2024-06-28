DO $$ BEGIN
 CREATE TYPE "public"."evidence_type" AS ENUM('image', 'document', 'link');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."user_role" AS ENUM('unit', 'admin', 'superadmin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"summary" text NOT NULL,
	"indicator_index" integer NOT NULL,
	"category_name" text NOT NULL,
	"unit_id" uuid NOT NULL,
	"upload_timestamp" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "categories" (
	"indicator_index" integer NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "categories_indicator_index_name_pk" PRIMARY KEY("indicator_index","name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "criteria" (
	"index" integer NOT NULL,
	"subindex" integer NOT NULL,
	"english_name" text NOT NULL,
	"spanish_alias" text NOT NULL,
	"category_name" text,
	CONSTRAINT "criteria_index_subindex_pk" PRIMARY KEY("index","subindex"),
	CONSTRAINT "criteria_subindex_unique" UNIQUE("subindex"),
	CONSTRAINT "criteria_english_name_unique" UNIQUE("english_name"),
	CONSTRAINT "criteria_spanish_alias_unique" UNIQUE("spanish_alias")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "evidence_feedback" (
	"activity_id" uuid NOT NULL,
	"evidence_number" serial NOT NULL,
	"admin_id" uuid NOT NULL,
	"feedback" "evidence_type" NOT NULL,
	CONSTRAINT "evidence_feedback_activity_id_evidence_number_pk" PRIMARY KEY("activity_id","evidence_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "evidence" (
	"activity_id" uuid NOT NULL,
	"evidence_number" serial NOT NULL,
	"link" text NOT NULL,
	"description" text NOT NULL,
	"upload_timestamp" timestamp NOT NULL,
	"type" "evidence_type" NOT NULL,
	CONSTRAINT "evidence_activity_id_evidence_number_pk" PRIMARY KEY("activity_id","evidence_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "image_evidence" (
	"activity_id" uuid NOT NULL,
	"evidence_number" integer NOT NULL,
	"link_to_related_resource" text NOT NULL,
	CONSTRAINT "image_evidence_activity_id_evidence_number_pk" PRIMARY KEY("activity_id","evidence_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "indicators" (
	"index" integer PRIMARY KEY NOT NULL,
	"english_name" text NOT NULL,
	"spanish_alias" text NOT NULL,
	CONSTRAINT "indicators_english_name_unique" UNIQUE("english_name"),
	CONSTRAINT "indicators_spanish_alias_unique" UNIQUE("spanish_alias")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recommended_categories" (
	"indicator_index" integer NOT NULL,
	"category_name" text NOT NULL,
	"unit_id" uuid NOT NULL,
	CONSTRAINT "recommended_categories_indicator_index_category_name_unit_id_pk" PRIMARY KEY("indicator_index","category_name","unit_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "upload_period" (
	"id" uuid PRIMARY KEY NOT NULL,
	"start_timestamp" timestamp NOT NULL,
	"end_timestamp" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" "user_role" NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activities" ADD CONSTRAINT "activities_unit_id_users_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activities" ADD CONSTRAINT "activities_indicator_index_category_name_categories_indicator_index_name_fk" FOREIGN KEY ("indicator_index","category_name") REFERENCES "public"."categories"("indicator_index","name") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "categories" ADD CONSTRAINT "categories_indicator_index_indicators_index_fk" FOREIGN KEY ("indicator_index") REFERENCES "public"."indicators"("index") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "criteria" ADD CONSTRAINT "criteria_index_indicators_index_fk" FOREIGN KEY ("index") REFERENCES "public"."indicators"("index") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "criteria" ADD CONSTRAINT "criteria_index_category_name_categories_indicator_index_name_fk" FOREIGN KEY ("index","category_name") REFERENCES "public"."categories"("indicator_index","name") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "evidence_feedback" ADD CONSTRAINT "evidence_feedback_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "evidence_feedback" ADD CONSTRAINT "evidence_feedback_activity_id_evidence_number_evidence_activity_id_evidence_number_fk" FOREIGN KEY ("activity_id","evidence_number") REFERENCES "public"."evidence"("activity_id","evidence_number") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "evidence" ADD CONSTRAINT "evidence_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "image_evidence" ADD CONSTRAINT "image_evidence_activity_id_evidence_number_evidence_activity_id_evidence_number_fk" FOREIGN KEY ("activity_id","evidence_number") REFERENCES "public"."evidence"("activity_id","evidence_number") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recommended_categories" ADD CONSTRAINT "recommended_categories_unit_id_users_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recommended_categories" ADD CONSTRAINT "recommended_categories_indicator_index_category_name_categories_indicator_index_name_fk" FOREIGN KEY ("indicator_index","category_name") REFERENCES "public"."categories"("indicator_index","name") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "criteria_index_english_name_index" ON "criteria" ("index","english_name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "criteria_index_spanish_alias_index" ON "criteria" ("index","spanish_alias");