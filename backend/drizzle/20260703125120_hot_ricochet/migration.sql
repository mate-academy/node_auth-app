ALTER TABLE "products"."description" ADD COLUMN "description_en" text NOT NULL;--> statement-breakpoint
ALTER TABLE "products"."description" ADD COLUMN "description_ua" text NOT NULL;--> statement-breakpoint
ALTER TABLE "products"."products" ADD COLUMN "namespace_id" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "products"."products" ADD COLUMN "images" text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "products"."products" ADD COLUMN "general_image" text NOT NULL;--> statement-breakpoint
ALTER TABLE "products"."description" DROP COLUMN "descriptionEn";--> statement-breakpoint
ALTER TABLE "products"."description" DROP COLUMN "descriptionUa";--> statement-breakpoint
ALTER TABLE "products"."products" DROP COLUMN "namespaceId";--> statement-breakpoint
ALTER TABLE "products"."products" DROP COLUMN "image";--> statement-breakpoint
ALTER TABLE "products"."phones" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "products"."phones" DROP COLUMN "ram";--> statement-breakpoint
ALTER TABLE "products"."categories" ADD CONSTRAINT "categories_name_key" UNIQUE("name");