import { createFileRoute } from "@tanstack/react-router";
import { BudgetPage } from "@/components/BudgetViews";
export const Route = createFileRoute("/budget")({
  head: () => ({ meta: [{ title: "Budget — Lotus Wealth 🪷" }] }),
  component: BudgetPage,
});
