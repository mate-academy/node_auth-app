CREATE TABLE "products"."descriptions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "products"."descriptions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"product_id" integer NOT NULL,
	"lang" varchar(2) NOT NULL,
	"title" text NOT NULL,
	"text" text[] NOT NULL
);
--> statement-breakpoint
DROP TABLE "products"."descriptionEn";--> statement-breakpoint
DROP TABLE "products"."descriptionUa";--> statement-breakpoint
ALTER TABLE "products"."descriptions" ADD CONSTRAINT "descriptions_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"."products"("id");