import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/AuthPage";

export const Route = createFileRoute("/sign-up")({
  head: () => ({ meta: [{ title: "Create account — Lotus Wealth 🪷" }] }),
  component: () => <AuthPage mode="signUp" />,
});
