
import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AuthLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthLayout({
  title,
  description,
  children,
}: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 px-4 py-10">
      <section className="w-full max-w-lg">
        <Card className="rounded-2xl border border-black/10 bg-white/80 px-2 py-6 shadow-xl shadow-black/5 backdrop-blur-md sm:px-6 sm:py-8">
          <CardHeader className="space-y-3 text-center">
            <CardTitle className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">
              {title}
            </CardTitle>

            <CardDescription className="text-sm leading-relaxed text-black/60 sm:text-base">
              {description}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-5">
            {children}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
