"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Levels", href: "/levels" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [menuState, setMenuState] = React.useState<{ open: boolean; path: string }>({
    open: false,
    path: pathname,
  });
  const toggleButtonRef = React.useRef<HTMLButtonElement>(null);
  const panelId = "mobile-primary-navigation";

  const mobileMenuOpen = menuState.open && menuState.path === pathname;

  const closeMenu = React.useCallback(() => {
    setMenuState({ open: false, path: pathname });
  }, [pathname]);

  const toggleMenu = React.useCallback(() => {
    setMenuState((prev) => {
      const isCurrentlyOpen = prev.open && prev.path === pathname;
      return { open: !isCurrentlyOpen, path: pathname };
    });
  }, [pathname]);

  React.useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
        toggleButtonRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen, closeMenu]);

  function isItemActive(href: string): boolean {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="rounded-[var(--radius-sm)] font-[var(--font-heading)] text-lg font-bold tracking-tight text-[var(--brand-navy)] transition-colors hover:text-[var(--accent-academic-blue)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)]"
        >
          {siteConfig.name}
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = isItemActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-[var(--radius-sm)] px-2 py-1 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)] ${
                  active
                    ? "text-[var(--accent-academic-blue)] underline decoration-2 underline-offset-8"
                    : "text-[var(--text-primary)] hover:text-[var(--accent-academic-blue)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          ref={toggleButtonRef}
          type="button"
          aria-expanded={mobileMenuOpen}
          aria-controls={panelId}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={toggleMenu}
          className="inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] px-3.5 text-sm font-medium text-[var(--brand-navy)] transition-colors hover:border-[var(--accent-academic-blue)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)] md:hidden"
        >
          {mobileMenuOpen ? "Close" : "Menu"}
        </button>
      </div>

      {mobileMenuOpen ? (
        <nav
          id={panelId}
          aria-label="Mobile Primary"
          className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] px-4 py-4 sm:px-6 md:hidden"
        >
          <ul className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => {
              const active = isItemActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={closeMenu}
                    className={`block rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)] ${
                      active
                        ? "bg-[var(--bg-surface-card)] text-[var(--accent-academic-blue)]"
                        : "text-[var(--brand-navy)] hover:bg-[var(--bg-surface-card)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

