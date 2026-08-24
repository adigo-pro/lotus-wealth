import { useCallback, useEffect, useState, type SetStateAction } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export const CONVEX_URL = import.meta.env.VITE_CONVEX_URL as string | undefined;
export const isConvexConfigured = Boolean(CONVEX_URL);

export type Expense = {
  id: string;
  name: string;
  amount: number;
  category: Category;
  essential: boolean;
};

export type Goal = {
  id: string;
  name: string;
  target: number;
  saved: number;
  emoji: string;
};

export const CATEGORIES = [
  "Rent & bills",
  "Groceries",
  "Beauty",
  "Fashion",
  "Fun & food",
  "Transport",
  "Subscriptions",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type BudgetState = {
  name: string;
  income: number;
  savingsRate: number;
  investRate: number;
  startingInvested: number;
  returnRate: number;
  years: number;
  expenses: Expense[];
  goals: Goal[];
  noBuyStreak: number;
};

export const defaultState: BudgetState = {
  name: "bestie",
  income: 4200,
  savingsRate: 20,
  investRate: 15,
  startingInvested: 3500,
  returnRate: 8,
  years: 20,
  noBuyStreak: 12,
  expenses: [
    { id: "e1", name: "Rent", amount: 1450, category: "Rent & bills", essential: true },
    { id: "e2", name: "Utilities + wifi", amount: 140, category: "Rent & bills", essential: true },
    { id: "e3", name: "Groceries", amount: 380, category: "Groceries", essential: true },
    { id: "e4", name: "Transit pass", amount: 90, category: "Transport", essential: true },
    { id: "e5", name: "Skincare restock", amount: 85, category: "Beauty", essential: false },
    { id: "e6", name: "Pilates class pack", amount: 120, category: "Fun & food", essential: false },
    { id: "e7", name: "Zara haul", amount: 160, category: "Fashion", essential: false },
    { id: "e8", name: "Streaming + apps", amount: 46, category: "Subscriptions", essential: false },
    { id: "e9", name: "Matcha runs", amount: 74, category: "Fun & food", essential: false },
  ],
  goals: [
    { id: "g1", name: "Emergency fund", target: 9000, saved: 3400, emoji: "🛟" },
    { id: "g2", name: "Roth IRA 2026", target: 7000, saved: 1850, emoji: "📈" },
    { id: "g3", name: "Italy summer trip", target: 3200, saved: 980, emoji: "🍋" },
  ],
};

const KEY = "rich-girl-budget-v1";

function useLocalBudget() {
  const [state, setState] = useState<BudgetState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...defaultState, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  const update = useCallback(
    <K extends keyof BudgetState>(key: K, value: BudgetState[K]) =>
      setState((s) => ({ ...s, [key]: value })),
    [],
  );

  return { state, setState, update, hydrated };
}

function useConvexBudget() {
  const snapshot = useQuery(api.budget.snapshot);
  const replaceState = useMutation(api.budget.replaceState);
  const seed = useMutation(api.budget.seed);
  const [state, setLocalState] = useState<BudgetState>(defaultState);
  const hydrated = snapshot !== undefined;

  useEffect(() => {
    if (!snapshot) return;
    setLocalState({
      name: snapshot.profile.name,
      income: snapshot.profile.income,
      savingsRate: snapshot.profile.savingsRate,
      investRate: snapshot.profile.investRate,
      startingInvested: snapshot.profile.startingInvested,
      returnRate: snapshot.profile.returnRate,
      years: snapshot.profile.years,
      noBuyStreak: snapshot.profile.noBuyStreak,
      expenses: snapshot.expenses.map((expense) => ({
        id: expense._id,
        name: expense.name,
        amount: expense.amount,
        category: expense.category,
        essential: expense.essential,
      })),
      goals: snapshot.goals.map((goal) => ({
        id: goal._id,
        name: goal.name,
        target: goal.target,
        saved: goal.saved,
        emoji: goal.emoji,
      })),
    });
  }, [snapshot]);

  useEffect(() => {
    if (snapshot === undefined) return;
    if (snapshot && (snapshot.expenses.length > 0 || snapshot.goals.length > 0)) return;
    void seed({
      expenses: defaultState.expenses.map(({ name, amount, category, essential }) => ({
        name,
        amount,
        category,
        essential,
      })),
      goals: defaultState.goals.map(({ name, target, saved, emoji }) => ({
        name,
        target,
        saved,
        emoji,
      })),
    }).catch(() => undefined);
  }, [seed, snapshot]);

  const setState = useCallback(
    (next: SetStateAction<BudgetState>) => {
      setLocalState((current) => {
        const resolved = typeof next === "function" ? next(current) : next;
        void replaceState({ state: resolved }).catch(() => undefined);
        return resolved;
      });
    },
    [replaceState],
  );

  const update = useCallback(
    <K extends keyof BudgetState>(key: K, value: BudgetState[K]) =>
      setState((s) => ({ ...s, [key]: value })),
    [setState],
  );

  return { state, setState, update, hydrated };
}

export const useBudget = isConvexConfigured ? useConvexBudget : useLocalBudget;

export const money = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export function derive(s: BudgetState) {
  const totalSpend = s.expenses.reduce((a, e) => a + e.amount, 0);
  const wants = s.expenses.filter((e) => !e.essential).reduce((a, e) => a + e.amount, 0);
  const needs = totalSpend - wants;
  const leftover = s.income - totalSpend;
  const monthlySaving = (s.income * s.savingsRate) / 100;
  const monthlyInvest = (s.income * s.investRate) / 100;
  const freeFlow = leftover - monthlySaving - monthlyInvest;
  const wantsShare = s.income ? (wants / s.income) * 100 : 0;
  const keepRate = s.income ? ((monthlySaving + monthlyInvest) / s.income) * 100 : 0;

  const byCategory = CATEGORIES.map((c) => ({
    name: c,
    value: s.expenses.filter((e) => e.category === c).reduce((a, e) => a + e.amount, 0),
  })).filter((c) => c.value > 0);

  const projection: { year: number; invested: number; contributed: number }[] = [];
  let balance = s.startingInvested;
  let contributed = s.startingInvested;
  for (let y = 0; y <= s.years; y++) {
    projection.push({
      year: y,
      invested: Math.round(balance),
      contributed: Math.round(contributed),
    });
    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + s.returnRate / 100 / 12) + monthlyInvest;
      contributed += monthlyInvest;
    }
  }
  const futureValue = projection[projection.length - 1]?.invested ?? 0;

  return {
    totalSpend,
    wants,
    needs,
    leftover,
    monthlySaving,
    monthlyInvest,
    freeFlow,
    wantsShare,
    keepRate,
    byCategory,
    projection,
    futureValue,
  };
}

export const AFFIRMATIONS = [
  "Not buying it is also a purchase — of your freedom.",
  "Quiet luxury is a fat index fund.",
  "Your future self is already rich, you're just catching up.",
  "Delulu is only solulu when it's compounding at 8%.",
  "Nothing outfits, maxed-out Roth. That's the vibe.",
  "The cart stays abandoned. The portfolio does not.",
  "Underconsumption core is just self respect with a spreadsheet.",
];
