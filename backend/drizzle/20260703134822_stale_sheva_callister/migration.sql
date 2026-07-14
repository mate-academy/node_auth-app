CREATE TABLE "products"."accessories" (
	"id" integer PRIMARY KEY,
	"resolution" varchar(255) NOT NULL,
	"processor" varchar(255) NOT NULL,
	"cell" varchar(255)[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products"."tablets" (
	"id" integer PRIMARY KEY,
	"resolution" varchar(255) NOT NULL,
	"processor" varchar(255) NOT NULL,
	"camera" varchar(255) NOT NULL,
	"zoom" varchar(255) NOT NULL,
	"cell" varchar(255)[] NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products"."accessories" ADD CONSTRAINT "accessories_id_products_id_fkey" FOREIGN KEY ("id") REFERENCES "products"."products"("id");--> statement-breakpoint
ALTER TABLE "products"."tablets" ADD CONSTRAINT "tablets_id_products_id_fkey" FOREIGN KEY ("id") REFERENCES "products"."products"("id");