CREATE SCHEMA "products";
--> statement-breakpoint
CREATE TABLE "products"."categories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "products"."categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"category" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products"."description" (
	"id" integer PRIMARY KEY,
	"descriptionEn" text NOT NULL,
	"descriptionUa" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products"."phones" (
	"id" integer PRIMARY KEY,
	"description" text NOT NULL,
	"resolution" varchar(255) NOT NULL,
	"processor" varchar(255) NOT NULL,
	"ram" varchar(255) NOT NULL,
	"camera" varchar(255) NOT NULL,
	"zoom" varchar(255) NOT NULL,
	"cell" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products"."products" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "products"."products_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"category_id" integer NOT NULL,
	"namespaceId" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"fullPrice" integer NOT NULL,
	"price" integer NOT NULL,
	"screen" varchar(255) NOT NULL,
	"capacity" varchar(255) NOT NULL,
	"color" varchar(255) NOT NULL,
	"ram" varchar(255) NOT NULL,
	"year" integer NOT NULL,
	"image" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products"."description" ADD CONSTRAINT "description_id_products_id_fkey" FOREIGN KEY ("id") REFERENCES "products"."products"("id");--> statement-breakpoint
ALTER TABLE "products"."phones" ADD CONSTRAINT "phones_id_products_id_fkey" FOREIGN KEY ("id") REFERENCES "products"."products"("id");--> statement-breakpoint
ALTER TABLE "products"."products" ADD CONSTRAINT "products_category_id_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "products"."categories"("id");