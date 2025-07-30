ALTER TABLE "workflow" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "workflow_folder" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "workspace" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "workflow" CASCADE;--> statement-breakpoint
DROP TABLE "workflow_folder" CASCADE;--> statement-breakpoint
DROP TABLE "workspace" CASCADE;--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "logo" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "metadata" json;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "active_organization_id" text;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_active_organization_id_organization_id_fk" FOREIGN KEY ("active_organization_id") REFERENCES "public"."organization"("id") ON DELETE set null ON UPDATE no action;