import { createFileRoute } from "@tanstack/react-router";
import { AccountAccess } from "@/components/AccountAccess";
import { AppShell, PageHeader } from "@/components/AppShell";
import { isConvexConfigured, useBudget } from "@/lib/budget-store";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "Account — Lotus Wealth 🪷" }] }),
  component: AccountPage,
});

function AccountPage() {
  const { account } = useBudget();
  return (
    <AppShell>
      <PageHeader
        eyebrow="Account"
        title="Your place in Lotus Wealth."
        description="Sign in to keep your budget, goals, and plan available whenever you return."
      />
      {isConvexConfigured ? (
        <AccountAccess account={account} />
      ) : (
        <p className="account-access px-5 py-5 text-sm text-muted-foreground">
          Account access is available on the live app. Your local changes are saved on this device.
        </p>
      )}
    </AppShell>
  );
}
