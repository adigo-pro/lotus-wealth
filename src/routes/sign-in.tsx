import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/AuthPage";

export const Route = createFileRoute("/sign-in")({
  head: () => ({ meta: [{ title: "Sign in — Lotus Wealth 🪷" }] }),
  component: () => <AuthPage mode="signIn" />,
});
