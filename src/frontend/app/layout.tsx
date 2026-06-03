import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import LogoutButton from "./components/logoutButton";
import SignInButton from "./components/signInButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Node Auth App",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans text-rose-50">
        <Providers>
          <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-rose-950 via-fuchsia-950 to-zinc-950 px-4 py-8 sm:py-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(244,63,94,0.34),transparent_32%),radial-gradient(circle_at_82%_14%,rgba(225,29,72,0.3),transparent_30%),radial-gradient(circle_at_50%_88%,rgba(190,24,93,0.26),transparent_40%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(9,9,11,0.1),rgba(9,9,11,0.4))]" />

              <header className="flex items-center justify-center px-6 py-6 backdrop-blur-sm sm:px-10">
                <div className="flex-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-rose-300/90">
                    Node Auth App
                  </p>
                  <h1 className="text-3xl font-bold tracking-tight text-rose-50 sm:text-4xl">
                    Homework <span className="text-rose-500">Dashboard</span>
                  </h1>
                </div>
                <LogoutButton />
                <SignInButton />
              </header>


              <main className="relative">
                {children}
              </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
