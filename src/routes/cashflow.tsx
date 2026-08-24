import { createFileRoute } from "@tanstack/react-router";
import { CashflowPage } from "@/components/BudgetViews";
export const Route = createFileRoute("/cashflow")({
  head: () => ({ meta: [{ title: "Cash flow — Lotus Wealth 🪷" }] }),
  component: CashflowPage,
});
