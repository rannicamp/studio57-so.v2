ALTER TABLE "employees" RENAME COLUMN "address" TO "address_street";--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "address_number" text;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "address_complement" text;