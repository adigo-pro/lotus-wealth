import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { derive, money, useBudget } from "@/lib/budget-store";

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
  { to: "/budget", label: "Budget", detail: "Income and expenses" },
  { to: "/goals", label: "Goals", detail: "Savings progress" },
  { to: "/plan", label: "Plan", detail: "Long-term outlook" },
] as const;

function HomePage() {
  const { state } = useBudget();
  const summary = useMemo(() => derive(state), [state]);

  return (
    <AppShell>
      <header className="home-intro grid gap-7 py-9 sm:py-12 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-sm text-muted-foreground">This month</p>
          <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Overview</h1>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Available</p>
          <p className="mt-1 font-display text-3xl font-semibold sm:text-4xl">
            {money(summary.freeFlow)}
          </p>
        </div>
      </header>

      <section className="overview-metrics grid grid-cols-3 border-y border-border">
        <div className="overview-metric py-5 pr-3 sm:pr-6">
          <p className="text-xs text-muted-foreground">Income</p>
          <p className="mt-2 font-display text-xl font-semibold sm:text-2xl">
            {money(state.income)}
          </p>
        </div>
        <div className="overview-metric px-3 py-5 sm:px-6">
          <p className="text-xs text-muted-foreground">Spent</p>
          <p className="mt-2 font-display text-xl font-semibold sm:text-2xl">
            {money(summary.totalSpend)}
          </p>
        </div>
        <div className="overview-metric py-5 pl-3 sm:pl-6">
          <p className="text-xs text-muted-foreground">Kept</p>
          <p className="mt-2 font-display text-xl font-semibold sm:text-2xl">
            {money(summary.monthlySaving + summary.monthlyInvest)}
          </p>
        </div>
      </section>

      <section className="py-8 sm:py-10">
        <div className="border-t border-border">
          {destinations.map(({ to, label, detail }) => (
            <Link
              key={to}
              to={to}
              className="destination-row group grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-border py-4"
            >
              <h2 className="font-display text-lg font-semibold">{label}</h2>
              <p className="text-xs text-muted-foreground">{detail}</p>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </section>

      <Link
        to="/cashflow"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"
      >
        View cash flow <ArrowRight className="size-4" />
      </Link>
    </AppShell>
  );
}
