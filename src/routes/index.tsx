import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChartNoAxesCombined, Goal, Landmark, ReceiptText } from "lucide-react";
import { useMemo } from "react";
import { AccountAccess } from "@/components/AccountAccess";
import { AppShell } from "@/components/AppShell";
import { derive, isConvexConfigured, money, useBudget } from "@/lib/budget-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lotus Wealth 🪷 — your money overview" },
      {
        name: "description",
        content: "A calm home for your budget, cash flow, goals, and long-term plan.",
      },
    ],
  }),
  component: HomePage,
});

const destinations = [
  { to: "/budget", label: "Budget", detail: "Edit income and monthly expenses", icon: ReceiptText },
  {
    to: "/cashflow",
    label: "Cash flow",
    detail: "See what is left after your plan",
    icon: Landmark,
  },
  { to: "/goals", label: "Goals", detail: "Fund what matters next", icon: Goal },
  {
    to: "/plan",
    label: "Long-term plan",
    detail: "Project investing over time",
    icon: ChartNoAxesCombined,
  },
] as const;

function HomePage() {
  const { state, hydrated, account } = useBudget();
  const summary = useMemo(() => derive(state), [state]);

  return (
    <AppShell>
      <header className="home-intro grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:py-20">
        <div>
          <p className="eyebrow">Your overview</p>
          <h1 className="mt-5 max-w-4xl font-display text-5xl font-bold leading-[0.98] sm:text-7xl">
            Your money, in focus.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
            One clear view of this month and the goals you are building toward.
          </p>
        </div>
        <div className="lg:pb-1">
          <p className="text-sm text-muted-foreground">Available after your plan</p>
          <p className="mt-2 font-display text-4xl font-bold sm:text-5xl">
            {money(summary.freeFlow)}
          </p>
          <Link
            to="/cashflow"
            className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary"
          >
            View cash flow <ArrowRight className="size-4" />
          </Link>
        </div>
      </header>

      <section className="overview-metrics grid border-y border-border sm:grid-cols-3">
        <div className="overview-metric py-6 sm:pr-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Monthly income
          </p>
          <p className="mt-3 font-display text-3xl font-bold">{money(state.income)}</p>
        </div>
        <div className="overview-metric py-6 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Spent
          </p>
          <p className="mt-3 font-display text-3xl font-bold">{money(summary.totalSpend)}</p>
        </div>
        <div className="overview-metric py-6 sm:pl-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Projected in {state.years}y
          </p>
          <p className="mt-3 font-display text-3xl font-bold">
            {hydrated ? money(summary.futureValue) : "—"}
          </p>
        </div>
      </section>

      <section className="grid gap-10 py-12 lg:grid-cols-[0.75fr_1.25fr] lg:py-16">
        <div>
          <p className="eyebrow">Workspace</p>
          <h2 className="mt-3 max-w-sm font-display text-3xl font-bold">
            Go straight to the part that needs attention.
          </h2>
        </div>
        <div className="border-t border-border">
          {destinations.map(({ to, label, detail, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="destination-row group grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-border py-5"
            >
              <Icon className="size-5 text-primary" />
              <div>
                <h3 className="font-display text-lg font-bold">{label}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{detail}</p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </section>

      {isConvexConfigured ? <AccountAccess account={account} compact /> : null}
    </AppShell>
  );
}
