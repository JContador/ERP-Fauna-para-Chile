ALTER TABLE "clientes" ADD COLUMN "rut" text NOT NULL;--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "giro" text;--> statement-breakpoint
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_rut_unique" UNIQUE("rut");