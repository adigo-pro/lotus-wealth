import { createFileRoute } from "@tanstack/react-router";
import { PlanPage } from "@/components/BudgetViews";
export const Route = createFileRoute("/plan")({
  head: () => ({ meta: [{ title: "Plan — Lotus Wealth 🪷" }] }),
  component: PlanPage,
});
