CREATE TABLE IF NOT EXISTS "collection_centers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" text NOT NULL,
	"state" varchar(100) NOT NULL,
	"city" varchar(100) NOT NULL,
	"needed_items" text,
	"contact_phone" varchar(50),
	"status" varchar(50) DEFAULT 'pendiente' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "news_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"source_url" text,
	"source_name" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "person_tips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unified_person_id" uuid NOT NULL,
	"information_text" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "platform_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform_id" uuid NOT NULL,
	"unified_person_id" uuid,
	"external_id" varchar(255) NOT NULL,
	"raw_first_name" varchar(255) NOT NULL,
	"raw_last_name" varchar(255) NOT NULL,
	"raw_document_id" varchar(50),
	"raw_status" varchar(50) NOT NULL,
	"raw_photo_url" text,
	"contact_info_encrypted" text,
	"raw_json" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "platforms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"webhook_url" text,
	"api_key_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "potential_duplicates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unified_person_id" uuid NOT NULL,
	"platform_report_id" uuid NOT NULL,
	"confidence_score" integer NOT NULL,
	"status" varchar(50) DEFAULT 'pendiente' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "unified_persons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"document_id" varchar(50),
	"age" integer,
	"gender" varchar(50),
	"status" varchar(50) DEFAULT 'desaparecido' NOT NULL,
	"last_seen_location" text,
	"last_seen_date" timestamp,
	"additional_details" text,
	"photo_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "person_tips" ADD CONSTRAINT "person_tips_unified_person_id_unified_persons_id_fk" FOREIGN KEY ("unified_person_id") REFERENCES "unified_persons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "platform_reports" ADD CONSTRAINT "platform_reports_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "platform_reports" ADD CONSTRAINT "platform_reports_unified_person_id_unified_persons_id_fk" FOREIGN KEY ("unified_person_id") REFERENCES "unified_persons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "potential_duplicates" ADD CONSTRAINT "potential_duplicates_unified_person_id_unified_persons_id_fk" FOREIGN KEY ("unified_person_id") REFERENCES "unified_persons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "potential_duplicates" ADD CONSTRAINT "potential_duplicates_platform_report_id_platform_reports_id_fk" FOREIGN KEY ("platform_report_id") REFERENCES "platform_reports"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
