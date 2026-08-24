import { createFileRoute } from "@tanstack/react-router";
import { HabitsPage } from "@/components/BudgetViews";
export const Route = createFileRoute("/habits")({
  head: () => ({ meta: [{ title: "Habits — Lotus Wealth 🪷" }] }),
  component: HabitsPage,
});
