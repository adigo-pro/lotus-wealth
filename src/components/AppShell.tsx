import { useConvexAuth } from "@convex-dev/auth/react";
import { Link } from "@tanstack/react-router";
import {
  ChartNoAxesCombined,
  CircleUserRound,
  Goal,
  House,
  Landmark,
  ReceiptText,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";
import { AccountAccess } from "@/components/AccountAccess";
import { isConvexConfigured } from "@/lib/budget-store";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: House },
  { to: "/budget", label: "Budget", icon: ReceiptText },
  { to: "/cashflow", label: "Cash flow", icon: Landmark },
  { to: "/goals", label: "Goals", icon: Goal },
  { to: "/habits", label: "Habits", icon: Sparkles },
  { to: "/plan", label: "Plan", icon: ChartNoAxesCombined },
] as const;

const MOBILE_NAV_ITEMS = NAV_ITEMS.filter(({ to }) =>
  ["/", "/budget", "/cashflow", "/goals", "/plan"].includes(to),
);

export function AppShell({ children }: { children: ReactNode }) {
  if (isConvexConfigured) return <AuthenticatedShell>{children}</AuthenticatedShell>;
  return <ShellLayout>{children}</ShellLayout>;
}

function AuthenticatedShell({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <main className="organic-shell mx-auto min-h-screen w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <GuestHeader />
        <GuestGate loading />
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="organic-shell mx-auto min-h-screen w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <GuestHeader />
        <GuestGate />
      </main>
    );
  }

  return <ShellLayout>{children}</ShellLayout>;
}

function GuestGate({ loading = false }: { loading?: boolean }) {
  return (
    <section className="guest-gate grid gap-8 py-12 sm:gap-10 sm:py-16 lg:min-h-[calc(100vh-5rem)] lg:grid-cols-[minmax(0,1.25fr)_minmax(22rem,0.75fr)] lg:items-center lg:gap-16 lg:py-12 xl:gap-24">
      <div>
        <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[1.04] sm:text-6xl lg:text-7xl">
          Your money starts with you.
        </h1>
      </div>
      {loading ? (
        <p className="border-t border-border py-5 text-sm text-muted-foreground">
          Opening your account...
        </p>
      ) : (
        <AccountAccess account={null} />
      )}
    </section>
  );
}

function GuestHeader() {
  return (
    <header className="site-nav flex min-h-20 items-center">
      <span className="font-display text-xl font-bold">
        Lotus Wealth <span aria-hidden="true">🪷</span>
      </span>
    </header>
  );
}

function ShellLayout({ children }: { children: ReactNode }) {
  return (
    <main className="organic-shell mx-auto min-h-screen w-full max-w-7xl px-4 pb-28 sm:px-6 lg:px-8 lg:pb-16">
      <nav
        aria-label="Main navigation"
        className="site-nav flex min-h-16 items-center justify-between gap-6"
      >
        <Link to="/" className="flex min-h-11 shrink-0 items-center font-display text-lg font-bold">
          Lotus Wealth <span aria-hidden="true">🪷</span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.slice(1).map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="nav-link px-3 py-2 text-sm font-semibold text-muted-foreground"
              activeProps={{ className: "nav-link-active" }}
            >
              {label}
            </Link>
          ))}
        </div>

        <Link
          to="/account"
          aria-label="Account"
          title="Account"
          className="grid size-11 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
          activeProps={{ className: "bg-secondary text-foreground" }}
        >
          <CircleUserRound className="size-5" />
        </Link>
      </nav>

      {children}

      <nav
        aria-label="Mobile navigation"
        className="mobile-nav fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 lg:hidden"
      >
        {MOBILE_NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="mobile-nav-link flex min-w-0 flex-col items-center gap-1 py-2 text-[10px] font-semibold text-muted-foreground"
            activeProps={{ className: "mobile-nav-active" }}
          >
            <Icon className="size-4" />
            <span className="max-w-full truncate">{label}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-heading grid gap-4 py-7 sm:py-9 lg:grid-cols-[1fr_auto] lg:items-end">
      <div>
        <h1 className="max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="justify-self-start lg:justify-self-end">{action}</div> : null}
    </header>
  );
}
