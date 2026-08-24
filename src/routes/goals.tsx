import { createFileRoute } from "@tanstack/react-router";
import { GoalsPage } from "@/components/BudgetViews";
export const Route = createFileRoute("/goals")({
  head: () => ({ meta: [{ title: "Goals — Lotus Wealth 🪷" }] }),
  component: GoalsPage,
});
