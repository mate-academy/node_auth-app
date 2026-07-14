CREATE TABLE "products"."descriptionEn" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "products"."descriptionEn_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"product_id" integer NOT NULL,
	"title" text NOT NULL,
	"text" text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products"."descriptionUa" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "products"."descriptionUa_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"product_id" integer NOT NULL,
	"title" text NOT NULL,
	"text" text[] NOT NULL
);
--> statement-breakpoint
DROP TABLE "products"."description";--> statement-breakpoint
ALTER TABLE "products"."descriptionEn" ADD CONSTRAINT "descriptionEn_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"."products"("id");--> statement-breakpoint
ALTER TABLE "products"."descriptionUa" ADD CONSTRAINT "descriptionUa_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"."products"("id");