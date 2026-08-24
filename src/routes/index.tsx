import { createFileRoute } from "@tanstack/react-router";
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import { useMemo, useState } from "react";
import {
  Heart,
  PiggyBank,
  Plus,
  Sparkles,
  Trash2,
  TrendingUp,
  Wallet,
  Flame,
  LogOut,
  Lock,
} from "lucide-react";
import { SpendPie, WealthChart } from "@/components/Charts";
import {
  AFFIRMATIONS,
  CATEGORIES,
  type Category,
  derive,
  isConvexConfigured,
  money,
  useBudget,
} from "@/lib/budget-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lotus Wealth 🪷 — budget tracker and wealth planner" },
      {
        name: "description",
        content:
          "A playful budget tracker for spending, savings goals, recurring bills, and long-term wealth planning.",
      },
      { property: "og:title", content: "Lotus Wealth 🪷" },
      {
        property: "og:description",
        content: "Budget softly, save clearly, and grow wealth with calm daily money habits.",
      },
    ],
  }),
  component: Index,
});

function Stat({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="metric-frond">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
        <span className="metric-icon grid size-8 place-items-center text-primary">{icon}</span>
      </div>
      <p className="mt-3 font-display text-2xl font-bold sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <div className="mt-1.5 flex items-center rounded-2xl border border-border bg-card px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
        <input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-transparent text-base font-semibold outline-none"
        />
        {suffix ? <span className="pl-1 text-sm text-muted-foreground">{suffix}</span> : null}
      </div>
    </label>
  );
}

function Slider({
  label,
  value,
  onChange,
  max,
  suffix = "%",
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  max: number;
  suffix?: string;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </span>
        <span className="font-display text-sm font-bold text-primary">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
      />
    </label>
  );
}

const TABS = ["Budget", "Cashflow", "No-buy era", "Goals", "Wealth", "Roadmap"] as const;
type Tab = (typeof TABS)[number];

function AuthPanel() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const [step, setStep] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState("");

  if (isLoading) {
    return (
      <div className="auth-strip mx-auto mt-6 max-w-2xl px-4 py-3 text-sm font-semibold text-muted-foreground">
        Opening your money workspace...
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="auth-strip mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <p className="text-sm font-semibold">Signed in. Your budget is saved.</p>
        <button
          onClick={() => void signOut()}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-bold text-muted-foreground hover:text-primary"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setError("");
        const formData = new FormData(event.currentTarget);
        void signIn("password", formData).catch((err) =>
          setError(err instanceof Error ? err.message : "Could not sign in."),
        );
      }}
      className="auth-strip mx-auto mt-6 grid max-w-2xl gap-2 p-3 sm:grid-cols-[1fr_1fr_auto_auto]"
    >
      <input
        name="email"
        type="email"
        placeholder="Email"
        className="rounded-xl bg-secondary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        className="rounded-xl bg-secondary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
      <input name="flow" type="hidden" value={step} />
      <button className="dream-gradient inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-primary-foreground">
        <Lock className="size-4" /> {step === "signIn" ? "Sign in" : "Sign up"}
      </button>
      <button
        type="button"
        onClick={() => setStep(step === "signIn" ? "signUp" : "signIn")}
        className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-muted-foreground"
      >
        {step === "signIn" ? "Create" : "Use login"}
      </button>
      {error ? (
        <p className="text-xs font-semibold text-destructive sm:col-span-4">{error}</p>
      ) : null}
    </form>
  );
}

function Index() {
  const { state, setState, update, hydrated } = useBudget();
  const d = useMemo(() => derive(state), [state]);
  const [tab, setTab] = useState<Tab>("Budget");
  const [affIndex, setAffIndex] = useState(0);
  const [draft, setDraft] = useState<{ name: string; amount: string; category: Category }>({
    name: "",
    amount: "",
    category: "Fun & food",
  });

  const addExpense = () => {
    if (!draft.name.trim() || !Number(draft.amount)) return;
    setState((s) => ({
      ...s,
      expenses: [
        ...s.expenses,
        {
          id: crypto.randomUUID(),
          name: draft.name.trim(),
          amount: Number(draft.amount),
          category: draft.category,
          essential: false,
        },
      ],
    }));
    setDraft({ name: "", amount: "", category: draft.category });
  };

  return (
    <main className="organic-shell mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <nav className="site-nav flex items-center justify-between py-4">
        <a href="/" className="font-display text-lg font-bold">
          Lotus Wealth 🪷
        </a>
        <div className="flex items-center gap-5 text-sm font-medium text-muted-foreground">
          <button onClick={() => setTab("Budget")} className="hover:text-foreground">
            Budget
          </button>
          <button
            onClick={() => setTab("Goals")}
            className="hidden hover:text-foreground sm:inline"
          >
            Goals
          </button>
          <button
            onClick={() => setTab("Wealth")}
            className="rounded-full bg-foreground px-4 py-2 text-primary-foreground hover:bg-primary"
          >
            Plan
          </button>
        </div>
      </nav>

      <header className="hero-editorial grid min-h-[calc(100vh-5rem)] items-center gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_390px] lg:py-20">
        <div>
          <p className="eyebrow flex items-center gap-2">
            <Sparkles className="size-3.5" /> money, made softer
          </p>
          <h1 className="mt-6 max-w-3xl font-display text-5xl font-bold leading-[0.96] sm:text-7xl lg:text-8xl">
            Your budget should feel calm enough to open every day.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Lotus Wealth keeps spending, cashflow, goals, and long-term growth in one warm place,
            without turning your money into a spreadsheet you avoid.
          </p>
          <div className="mt-8 max-w-2xl">
            {isConvexConfigured ? (
              <AuthPanel />
            ) : (
              <div className="auth-strip px-4 py-3 text-sm font-semibold text-muted-foreground">
                Local preview mode. Sign-in saving is available on the live app.
              </div>
            )}
          </div>
        </div>

        <aside
          className="phone-preview hidden justify-self-center lg:block"
          aria-label="Lotus Wealth preview"
        >
          <div className="phone-shell">
            <div className="phone-screen">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  Lotus
                </span>
                <span className="text-lg">🪷</span>
              </div>
              <p className="mt-10 text-sm text-muted-foreground">left this month</p>
              <p className="font-display text-5xl font-bold">{money(d.freeFlow)}</p>
              <div className="mt-8 space-y-3">
                {state.expenses.slice(0, 4).map((expense) => (
                  <div key={expense.id} className="phone-row flex items-center justify-between">
                    <span>{expense.name}</span>
                    <strong>{money(expense.amount)}</strong>
                  </div>
                ))}
              </div>
              <div className="phone-growth mt-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    projected
                  </p>
                  <p className="font-display text-2xl font-bold">{money(d.futureValue)}</p>
                </div>
                <TrendingUp className="size-5 text-primary" />
              </div>
            </div>
          </div>
        </aside>
      </header>

      <button
        onClick={() => setAffIndex((i) => (i + 1) % AFFIRMATIONS.length)}
        className="affirmation-bloom float-slow mx-auto mt-8 flex w-full max-w-2xl items-center gap-3 px-5 py-4 text-left text-primary-foreground transition-transform active:scale-[0.99]"
      >
        <Heart className="size-5 shrink-0" />
        <span className="font-display text-base font-semibold sm:text-lg">
          {AFFIRMATIONS[affIndex]}
        </span>
        <span className="ml-auto hidden text-xs uppercase tracking-widest opacity-80 sm:block">
          tap
        </span>
      </button>

      <section className="stat-garden mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat
          label="Monthly in"
          value={money(state.income)}
          hint="after-tax income"
          icon={<Wallet className="size-4" />}
        />
        <Stat
          label="Spent"
          value={money(d.totalSpend)}
          hint={`${Math.round((d.totalSpend / (state.income || 1)) * 100)}% of income`}
          icon={<Flame className="size-4" />}
        />
        <Stat
          label="Kept"
          value={money(d.monthlySaving + d.monthlyInvest)}
          hint={`${Math.round(d.keepRate)}% keep rate`}
          icon={<PiggyBank className="size-4" />}
        />
        <Stat
          label={`Net worth in ${state.years}y`}
          value={hydrated ? money(d.futureValue) : "—"}
          hint={`at ${state.returnRate}% avg return`}
          icon={<TrendingUp className="size-4" />}
        />
      </section>

      <nav className="tab-stream mt-8 flex snap-x gap-2 overflow-x-auto p-1.5">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`snap-start whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t ? "active-tab text-primary" : "text-muted-foreground hover:text-primary"
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      {tab === "Budget" && (
        <section className="budget-workspace mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
          <div className="ledger-sheet p-4 sm:p-6">
            <h2 className="font-display text-xl font-bold">The spreadsheet</h2>
            <p className="text-xs text-muted-foreground">
              Tap the dot to mark a line as a need. Everything else is a want, bestie.
            </p>

            <ul className="mt-4 space-y-2">
              {state.expenses.map((e) => (
                <li key={e.id} className="ledger-row flex items-center gap-3 px-3 py-2.5">
                  <button
                    aria-label="toggle essential"
                    onClick={() =>
                      setState((s) => ({
                        ...s,
                        expenses: s.expenses.map((x) =>
                          x.id === e.id ? { ...x, essential: !x.essential } : x,
                        ),
                      }))
                    }
                    className={`size-3.5 shrink-0 rounded-full transition-colors ${
                      e.essential ? "bg-mint" : "bg-bubblegum"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{e.name}</p>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {e.category} · {e.essential ? "need" : "want"}
                    </p>
                  </div>
                  <input
                    type="number"
                    value={e.amount}
                    onChange={(ev) =>
                      setState((s) => ({
                        ...s,
                        expenses: s.expenses.map((x) =>
                          x.id === e.id ? { ...x, amount: Number(ev.target.value) } : x,
                        ),
                      }))
                    }
                    className="w-20 rounded-xl bg-secondary px-2 py-1 text-right text-sm font-bold outline-none focus:ring-2 focus:ring-ring sm:w-24"
                  />
                  <button
                    aria-label={`delete ${e.name}`}
                    onClick={() =>
                      setState((s) => ({
                        ...s,
                        expenses: s.expenses.filter((x) => x.id !== e.id),
                      }))
                    }
                    className="text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="seed-row mt-4 grid gap-2 p-3 sm:grid-cols-[1.4fr_0.8fr_1fr_auto]">
              <input
                placeholder="What did we buy…"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="rounded-xl bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                placeholder="$"
                type="number"
                value={draft.amount}
                onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
                className="rounded-xl bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <select
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value as Category })}
                className="rounded-xl bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <button
                onClick={addExpense}
                className="dream-gradient flex items-center justify-center gap-1 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                <Plus className="size-4" /> Add
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="chart-bloom p-4 sm:p-6">
              <h2 className="font-display text-xl font-bold">Where it goes</h2>
              {hydrated ? <SpendPie data={d.byCategory} /> : <div className="h-56" />}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="split-metric p-3">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Needs
                  </p>
                  <p className="font-display text-lg font-bold">{money(d.needs)}</p>
                </div>
                <div className="split-metric p-3">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Wants
                  </p>
                  <p className="font-display text-lg font-bold">{money(d.wants)}</p>
                </div>
              </div>
            </div>

            <div className="number-panel space-y-4 p-4 sm:p-6">
              <h2 className="font-display text-xl font-bold">Your numbers</h2>
              <Field
                label="Monthly income"
                value={state.income}
                onChange={(v) => update("income", v)}
                suffix="$"
              />
              <Slider
                label="Save rate"
                value={state.savingsRate}
                onChange={(v) => update("savingsRate", v)}
                max={60}
              />
              <Slider
                label="Invest rate"
                value={state.investRate}
                onChange={(v) => update("investRate", v)}
                max={60}
              />
              <p
                className={`status-strip px-3 py-2 text-sm font-semibold ${
                  d.freeFlow >= 0
                    ? "bg-mint/30 text-foreground"
                    : "bg-destructive/15 text-destructive"
                }`}
              >
                {d.freeFlow >= 0
                  ? `${money(d.freeFlow)} guilt-free left over. Slay responsibly.`
                  : `You're ${money(Math.abs(d.freeFlow))} over. Trim a want, not your dreams.`}
              </p>
            </div>
          </div>
        </section>
      )}

      {tab === "Cashflow" && (
        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="ledger-sheet p-5 sm:p-7">
            <h2 className="font-display text-xl font-bold">Monthly runway</h2>
            <div className="mt-5 space-y-3">
              {[
                ["Income", state.income],
                ["Needs", -d.needs],
                ["Wants", -d.wants],
                ["Savings", -d.monthlySaving],
                ["Investments", -d.monthlyInvest],
                ["Flexible cash", d.freeFlow],
              ].map(([label, value]) => (
                <div key={label} className="river-row flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-semibold">{label}</span>
                  <span
                    className={`font-display text-lg font-bold ${Number(value) < 0 ? "text-muted-foreground" : "text-primary"}`}
                  >
                    {money(Number(value))}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="note-stack p-5 sm:p-7">
            <h2 className="font-display text-xl font-bold">Money workspace</h2>
            <div className="mt-4 grid gap-3">
              {[
                ["Account", "Sign in to keep your plan available across sessions."],
                ["Expenses", "Track needs, wants, categories, and monthly totals."],
                ["Goals", "Follow progress toward emergency funds, trips, and investing targets."],
                ["Cashflow", "See what is left after bills, savings, and investing."],
              ].map(([label, value]) => (
                <div key={label} className="note-line px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    {label}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {tab === "No-buy era" && (
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="meter-panel p-5 sm:p-7">
            <h2 className="font-display text-xl font-bold">Underconsumption meter</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Wants as a share of income. Under 25% = quietly wealthy.
            </p>
            <div className="mt-6 h-5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="dream-gradient h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, d.wantsShare)}%` }}
              />
            </div>
            <div className="mt-3 flex justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
              <span>0%</span>
              <span>25% sweet spot</span>
              <span>50%+</span>
            </div>
            <p className="mt-5 font-display text-3xl font-bold">
              {Math.round(d.wantsShare)}% on wants
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {d.wantsShare < 15
                ? "Monk mode unlocked. Make sure life still feels good."
                : d.wantsShare < 25
                  ? "Immaculate balance. This is the underconsumption blueprint."
                  : d.wantsShare < 40
                    ? "Cute but leaky — pick two wants to pause this month."
                    : "The cart is winning. Time for a 30-day no-buy reset."}
            </p>
          </div>

          <div className="streak-panel p-5 sm:p-7">
            <h2 className="font-display text-xl font-bold">No-buy streak</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Days you kept the cart abandoned. Consistency is the flex.
            </p>
            <p className="lotus-number mt-6 font-display text-6xl font-bold sm:text-7xl">
              {state.noBuyStreak}
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => update("noBuyStreak", state.noBuyStreak + 1)}
                className="dream-gradient flex-1 rounded-2xl px-4 py-3 text-sm font-semibold text-primary-foreground"
              >
                +1 day strong
              </button>
              <button
                onClick={() => update("noBuyStreak", 0)}
                className="rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-muted-foreground"
              >
                Reset
              </button>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="split-metric p-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Skipped wants value
                </p>
                <p className="font-display text-lg font-bold">
                  {money(Math.round((d.wants / 30) * state.noBuyStreak))}
                </p>
              </div>
              <div className="split-metric p-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  If invested 30y
                </p>
                <p className="font-display text-lg font-bold">
                  {money(Math.round((d.wants / 30) * state.noBuyStreak * 10))}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {tab === "Goals" && (
        <section className="goal-garden mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {state.goals.map((g) => {
            const pct = Math.min(100, (g.saved / (g.target || 1)) * 100);
            return (
              <div key={g.id} className="goal-stem p-5">
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{g.emoji}</span>
                  <button
                    aria-label={`delete ${g.name}`}
                    onClick={() =>
                      setState((s) => ({ ...s, goals: s.goals.filter((x) => x.id !== g.id) }))
                    }
                    className="text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <h3 className="mt-3 font-display text-lg font-bold">{g.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {money(g.saved)} of {money(g.target)}
                </p>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="dream-gradient h-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-2 text-xs font-semibold text-primary">{Math.round(pct)}% there</p>
                <div className="mt-4 flex gap-2">
                  {[50, 100, 250].map((amt) => (
                    <button
                      key={amt}
                      onClick={() =>
                        setState((s) => ({
                          ...s,
                          goals: s.goals.map((x) =>
                            x.id === g.id ? { ...x, saved: x.saved + amt } : x,
                          ),
                        }))
                      }
                      className="flex-1 rounded-xl bg-secondary py-2 text-xs font-bold text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      +${amt}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          <button
            onClick={() =>
              setState((s) => ({
                ...s,
                goals: [
                  ...s.goals,
                  {
                    id: crypto.randomUUID(),
                    name: "New dream fund",
                    target: 2000,
                    saved: 0,
                    emoji: "✨",
                  },
                ],
              }))
            }
            className="add-goal grid min-h-40 place-items-center text-sm font-semibold text-primary transition-colors hover:bg-card/60"
          >
            <span className="flex items-center gap-2">
              <Plus className="size-4" /> New goal
            </span>
          </button>
        </section>
      )}

      {tab === "Wealth" && (
        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="chart-pond p-4 sm:p-6">
            <h2 className="font-display text-xl font-bold">Compounding era</h2>
            <p className="text-xs text-muted-foreground">
              Investing {money(d.monthlyInvest)}/mo — the pink line is the market doing the heavy
              lifting.
            </p>
            {hydrated ? <WealthChart data={d.projection} /> : <div className="h-64" />}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="split-metric p-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  You contribute
                </p>
                <p className="font-display text-lg font-bold">
                  {money(d.projection[d.projection.length - 1]?.contributed ?? 0)}
                </p>
              </div>
              <div className="split-metric p-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Free growth
                </p>
                <p className="font-display text-lg font-bold text-primary">
                  {money(
                    (d.futureValue || 0) -
                      (d.projection[d.projection.length - 1]?.contributed ?? 0),
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="assumption-panel space-y-5 p-5">
            <h2 className="font-display text-xl font-bold">Assumptions</h2>
            <Field
              label="Already invested"
              value={state.startingInvested}
              onChange={(v) => update("startingInvested", v)}
              suffix="$"
            />
            <Slider
              label="Avg return"
              value={state.returnRate}
              onChange={(v) => update("returnRate", v)}
              max={15}
            />
            <Slider
              label="Time horizon"
              value={state.years}
              onChange={(v) => update("years", Math.max(1, v))}
              max={45}
              suffix="y"
            />
            <p className="status-strip px-3 py-2 text-xs text-muted-foreground">
              Index funds, boring and beautiful. This is a projection, not financial advice — future
              you still has to press invest.
            </p>
          </div>
        </section>
      )}

      {tab === "Roadmap" && (
        <section className="roadmap-path mt-6 grid gap-4 lg:grid-cols-3">
          {[
            [
              "1. Account Setup",
              "Profile settings, password recovery, and a smoother first-budget walkthrough.",
            ],
            [
              "2. Budgeting",
              "Add monthly budgets, category caps, recurring bill reminders, and transaction review.",
            ],
            [
              "3. Goals",
              "Add goal deadlines, auto-contribution plans, emergency fund health, and milestone history.",
            ],
            [
              "4. Insights",
              "Add cashflow trends, subscription audits, no-buy challenges, and monthly reports.",
            ],
            [
              "5. Imports",
              "Add transaction uploads and guided cleanup for messy spending history.",
            ],
            [
              "6. Polish",
              "Add reminders, empty states, mobile refinements, and calmer monthly review flows.",
            ],
          ].map(([title, body]) => (
            <div key={title} className="path-step p-5">
              <h3 className="font-display text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </section>
      )}

      <footer className="mt-14 text-center text-xs text-muted-foreground">
        {isConvexConfigured
          ? "Your plan is saved when signed in. Lotus Wealth grows with every clean decision."
          : "Saved automatically on your device. Sign-in saving is available on the live app."}
      </footer>
    </main>
  );
}
