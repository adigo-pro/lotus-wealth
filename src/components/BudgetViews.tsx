import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { SpendPie, WealthChart } from "@/components/Charts";
import { AppShell, PageHeader } from "@/components/AppShell";
import { CATEGORIES, type Category, derive, money, useBudget } from "@/lib/budget-store";

export function Field({
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
      <div className="mt-1.5 flex items-center rounded-full border border-border bg-card px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
        <input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full bg-transparent text-base font-semibold outline-none"
        />
        {suffix ? <span className="pl-1 text-sm text-muted-foreground">{suffix}</span> : null}
      </div>
    </label>
  );
}

export function Slider({
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
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
      />
    </label>
  );
}

export function BudgetPage() {
  const { state, setState, update, hydrated } = useBudget();
  const summary = useMemo(() => derive(state), [state]);
  const [draft, setDraft] = useState<{ name: string; amount: string; category: Category }>({
    name: "",
    amount: "",
    category: "Fun & food",
  });

  const addExpense = () => {
    if (!draft.name.trim() || !Number(draft.amount)) return;
    setState((current) => ({
      ...current,
      expenses: [
        ...current.expenses,
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
    <AppShell>
      <PageHeader
        eyebrow="Monthly budget"
        title="Give every dollar a place."
        description="Edit your income, set what you want to keep, and keep the month honest as spending changes."
        action={<p className="font-display text-3xl font-bold">{money(summary.freeFlow)} free</p>}
      />

      <section className="budget-workspace grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
        <div className="ledger-sheet p-4 sm:p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold">Expenses</h2>
              <p className="mt-1 text-xs text-muted-foreground">Select the dot to mark a need.</p>
            </div>
            <p className="text-sm font-semibold">{money(summary.totalSpend)}</p>
          </div>

          <ul className="mt-5">
            {state.expenses.map((expense) => (
              <li key={expense.id} className="ledger-row flex items-center gap-3 py-3">
                <button
                  aria-label={`Mark ${expense.name} as ${expense.essential ? "a want" : "a need"}`}
                  onClick={() =>
                    setState((current) => ({
                      ...current,
                      expenses: current.expenses.map((item) =>
                        item.id === expense.id ? { ...item, essential: !item.essential } : item,
                      ),
                    }))
                  }
                  className={`size-3.5 shrink-0 rounded-full ${expense.essential ? "bg-primary" : "bg-muted-foreground/30"}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{expense.name}</p>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {expense.category} · {expense.essential ? "need" : "want"}
                  </p>
                </div>
                <input
                  aria-label={`${expense.name} amount`}
                  type="number"
                  value={expense.amount}
                  onChange={(event) =>
                    setState((current) => ({
                      ...current,
                      expenses: current.expenses.map((item) =>
                        item.id === expense.id
                          ? { ...item, amount: Number(event.target.value) }
                          : item,
                      ),
                    }))
                  }
                  className="w-20 bg-transparent text-right text-sm font-bold outline-none sm:w-24"
                />
                <button
                  aria-label={`Delete ${expense.name}`}
                  onClick={() =>
                    setState((current) => ({
                      ...current,
                      expenses: current.expenses.filter((item) => item.id !== expense.id),
                    }))
                  }
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>

          <div className="seed-row mt-5 grid gap-2 p-3 sm:grid-cols-[1.4fr_0.8fr_1fr_auto]">
            <input
              aria-label="Expense name"
              placeholder="New expense"
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              className="bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              aria-label="Expense amount"
              placeholder="$0"
              type="number"
              value={draft.amount}
              onChange={(event) => setDraft({ ...draft, amount: event.target.value })}
              className="bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <select
              aria-label="Expense category"
              value={draft.category}
              onChange={(event) => setDraft({ ...draft, category: event.target.value as Category })}
              className="bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              {CATEGORIES.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
            <button
              onClick={addExpense}
              className="primary-button flex items-center justify-center gap-1 px-4 py-2 text-sm font-semibold"
            >
              <Plus className="size-4" /> Add
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="chart-bloom p-5 sm:p-6">
            <h2 className="font-display text-xl font-bold">Where it goes</h2>
            {hydrated ? <SpendPie data={summary.byCategory} /> : <div className="h-56" />}
            <div className="grid grid-cols-2 gap-5 border-t border-border pt-4">
              <div>
                <p className="text-xs text-muted-foreground">Needs</p>
                <p className="font-display text-xl font-bold">{money(summary.needs)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Wants</p>
                <p className="font-display text-xl font-bold">{money(summary.wants)}</p>
              </div>
            </div>
          </div>
          <div className="number-panel space-y-5 p-5 sm:p-6">
            <h2 className="font-display text-xl font-bold">Monthly settings</h2>
            <Field
              label="Monthly income"
              value={state.income}
              onChange={(value) => update("income", value)}
              suffix="$"
            />
            <Slider
              label="Save rate"
              value={state.savingsRate}
              onChange={(value) => update("savingsRate", value)}
              max={60}
            />
            <Slider
              label="Invest rate"
              value={state.investRate}
              onChange={(value) => update("investRate", value)}
              max={60}
            />
          </div>
        </div>
      </section>
    </AppShell>
  );
}

export function CashflowPage() {
  const { state } = useBudget();
  const summary = useMemo(() => derive(state), [state]);
  const rows = [
    ["Income", state.income],
    ["Needs", -summary.needs],
    ["Wants", -summary.wants],
    ["Savings", -summary.monthlySaving],
    ["Investments", -summary.monthlyInvest],
  ] as const;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Cash flow"
        title="See what moves each month."
        description="A simple path from money coming in to money left for the life you actually want."
      />
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="ledger-sheet p-5 sm:p-7">
          <h2 className="font-display text-xl font-bold">Monthly flow</h2>
          <div className="mt-5">
            {rows.map(([label, value]) => (
              <div key={label} className="river-row flex items-center justify-between py-4">
                <span className="text-sm font-semibold">{label}</span>
                <span
                  className={
                    Number(value) < 0
                      ? "font-display text-lg text-muted-foreground"
                      : "font-display text-lg font-bold"
                  }
                >
                  {money(Number(value))}
                </span>
              </div>
            ))}
          </div>
        </div>
        <aside className="cashflow-balance flex min-h-72 flex-col justify-between p-6 sm:p-8">
          <p className="eyebrow">Available after your plan</p>
          <div>
            <p className="font-display text-5xl font-bold sm:text-6xl">{money(summary.freeFlow)}</p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
              {summary.freeFlow >= 0
                ? "This is flexible money after expenses, saving, and investing."
                : "Your plan currently asks for more than this month brings in."}
            </p>
          </div>
        </aside>
      </section>
    </AppShell>
  );
}

export function GoalsPage() {
  const { state, setState } = useBudget();
  return (
    <AppShell>
      <PageHeader
        eyebrow="Goals"
        title="Make progress visible."
        description="Keep each goal specific, funded, and close enough to act on today."
        action={
          <button
            onClick={() =>
              setState((current) => ({
                ...current,
                goals: [
                  ...current.goals,
                  {
                    id: crypto.randomUUID(),
                    name: "New goal",
                    target: 2000,
                    saved: 0,
                    emoji: "🪷",
                  },
                ],
              }))
            }
            className="primary-button inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold"
          >
            <Plus className="size-4" /> New goal
          </button>
        }
      />
      <section className="goal-list border-t border-border">
        {state.goals.map((goal) => {
          const percent = Math.min(100, (goal.saved / (goal.target || 1)) * 100);
          return (
            <article
              key={goal.id}
              className="goal-line grid gap-5 py-6 sm:grid-cols-[auto_1fr_1fr_auto] sm:items-center"
            >
              <span className="text-3xl" aria-hidden="true">
                {goal.emoji}
              </span>
              <div>
                <h2 className="font-display text-xl font-bold">{goal.name}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {money(goal.saved)} of {money(goal.target)}
                </p>
              </div>
              <div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="primary-fill h-full" style={{ width: `${percent}%` }} />
                </div>
                <p className="mt-2 text-xs font-semibold text-primary">
                  {Math.round(percent)}% complete
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setState((current) => ({
                      ...current,
                      goals: current.goals.map((item) =>
                        item.id === goal.id ? { ...item, saved: item.saved + 100 } : item,
                      ),
                    }))
                  }
                  className="rounded-full bg-secondary px-3 py-2 text-xs font-bold"
                >
                  Add $100
                </button>
                <button
                  aria-label={`Delete ${goal.name}`}
                  onClick={() =>
                    setState((current) => ({
                      ...current,
                      goals: current.goals.filter((item) => item.id !== goal.id),
                    }))
                  }
                  className="grid size-9 place-items-center text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </AppShell>
  );
}

export function HabitsPage() {
  const { state, update } = useBudget();
  const summary = useMemo(() => derive(state), [state]);
  return (
    <AppShell>
      <PageHeader
        eyebrow="Habits"
        title="Spend with a little more intention."
        description="A light-touch check on discretionary spending and the days you choose not to buy."
      />
      <section className="grid gap-8 lg:grid-cols-2">
        <div className="meter-panel p-6 sm:p-8">
          <p className="eyebrow">Wants share</p>
          <p className="mt-5 font-display text-6xl font-bold">{Math.round(summary.wantsShare)}%</p>
          <div className="mt-8 h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="primary-fill h-full"
              style={{ width: `${Math.min(100, summary.wantsShare)}%` }}
            />
          </div>
          <div className="mt-3 flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>25% guide</span>
            <span>50%+</span>
          </div>
          <p className="mt-8 text-sm leading-6 text-muted-foreground">
            {summary.wantsShare < 25
              ? "Your flexible spending is within the guide. Keep room for joy and your future."
              : "Choose one or two wants to pause before the month gets crowded."}
          </p>
        </div>
        <div className="streak-panel p-6 sm:p-8">
          <p className="eyebrow">No-buy streak</p>
          <div className="mt-5 flex items-end gap-3">
            <p className="font-display text-6xl font-bold text-primary">{state.noBuyStreak}</p>
            <p className="pb-2 text-sm text-muted-foreground">days</p>
          </div>
          <p className="mt-5 text-sm leading-6 text-muted-foreground">
            About {money(Math.round((summary.wants / 30) * state.noBuyStreak))} in typical wants
            left untouched during this streak.
          </p>
          <div className="mt-8 flex gap-3">
            <button
              onClick={() => update("noBuyStreak", state.noBuyStreak + 1)}
              className="primary-button flex-1 px-4 py-3 text-sm font-semibold"
            >
              Add a day
            </button>
            <button
              onClick={() => update("noBuyStreak", 0)}
              className="rounded-full border border-border px-4 py-3 text-sm font-semibold text-muted-foreground"
            >
              Reset
            </button>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

export function PlanPage() {
  const { state, update, hydrated } = useBudget();
  const summary = useMemo(() => derive(state), [state]);
  const contributed = summary.projection[summary.projection.length - 1]?.contributed ?? 0;
  return (
    <AppShell>
      <PageHeader
        eyebrow="Long-term plan"
        title="Let time do more of the work."
        description={`At your current pace, the plan reaches ${money(summary.futureValue)} in ${state.years} years.`}
      />
      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="chart-pond p-5 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-xl font-bold">Growth projection</h2>
            <p className="text-sm text-muted-foreground">
              {money(summary.monthlyInvest)} invested monthly
            </p>
          </div>
          {hydrated ? <WealthChart data={summary.projection} /> : <div className="h-64" />}
          <div className="grid grid-cols-2 gap-6 border-t border-border pt-5">
            <div>
              <p className="text-xs text-muted-foreground">Contributions</p>
              <p className="mt-1 font-display text-xl font-bold">{money(contributed)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Estimated growth</p>
              <p className="mt-1 font-display text-xl font-bold text-primary">
                {money(summary.futureValue - contributed)}
              </p>
            </div>
          </div>
        </div>
        <aside className="assumption-panel space-y-6 p-5 sm:p-6">
          <h2 className="font-display text-xl font-bold">Assumptions</h2>
          <Field
            label="Already invested"
            value={state.startingInvested}
            onChange={(value) => update("startingInvested", value)}
            suffix="$"
          />
          <Slider
            label="Average return"
            value={state.returnRate}
            onChange={(value) => update("returnRate", value)}
            max={15}
          />
          <Slider
            label="Time horizon"
            value={state.years}
            onChange={(value) => update("years", Math.max(1, value))}
            max={45}
            suffix=" years"
          />
          <p className="border-t border-border pt-4 text-xs leading-5 text-muted-foreground">
            This estimate is a planning guide, not a promise of future returns.
          </p>
        </aside>
      </section>
    </AppShell>
  );
}
