import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.tagline,
};

function HeaderFallback() {
  return (
    <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <span className="font-[var(--font-heading)] text-lg font-bold tracking-tight text-[var(--brand-navy)]">
          {siteConfig.name}
        </span>
      </div>
    </header>
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)] antialiased selection:bg-[var(--bg-surface-secondary)] selection:text-[var(--brand-navy)]">
        <Suspense fallback={<HeaderFallback />}>
          <SiteHeader />
        </Suspense>
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}

