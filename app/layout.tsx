import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/hooks/use-auth";
import { Suspense } from "react";
import "./globals.css";
import { PokemonCardsProvider } from "@/hooks/use-pokemon-cards";
export const metadata: Metadata = {
  title: "Kortly",
  description: "Collect and trade Pokemon cards - Gotta catch em all!",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <AuthProvider>
            <PokemonCardsProvider>{children}</PokemonCardsProvider>
          </AuthProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
