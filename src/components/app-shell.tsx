"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";

const navigation = [
  { label: "Dashboard", href: "/" },
  { label: "Files", href: "/files" },
  { label: "Projects", href: "/projects" },
  { label: "KIPP", href: "/kipp" },
  { label: "Settings", href: "/settings" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  useEffect(() => {
    if (!sidebarOpen) {
      return;
    }

    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSidebar();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [sidebarOpen, closeSidebar]);

  return (
    <div className="flex min-h-screen bg-neutral-950 text-white">
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-white/10 bg-neutral-900/80 backdrop-blur-xl transition-transform duration-200 ease-out lg:static lg:translate-x-0 lg:border-r lg:bg-transparent lg:backdrop-blur-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center px-6 text-lg font-semibold tracking-tight lg:hidden">Validatio</div>
        <nav className="flex flex-1 flex-col gap-1 px-4 pb-6 pt-4 lg:px-6 lg:pb-8 lg:pt-8">
          {navigation.map(item => {
            const isActive = item.href === "/" ? pathname === item.href : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-white/10 ${
                  isActive ? "bg-white/15 text-white" : "text-white/70"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      ) : null}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-neutral-950/80 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 lg:hidden"
                onClick={() => setSidebarOpen(open => !open)}
                aria-label="Toggle navigation"
              >
                <span className="block h-0.5 w-5 rounded-full bg-white" />
                <span className="mt-1 block h-0.5 w-5 rounded-full bg-white" />
                <span className="mt-1 block h-0.5 w-5 rounded-full bg-white" />
              </button>
              <div className="text-lg font-semibold tracking-tight text-white">Validatio</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-sm text-white/60 sm:block">Welcome back</div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-xs font-medium uppercase text-white/80">
                VA
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:gap-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default AppShell;
