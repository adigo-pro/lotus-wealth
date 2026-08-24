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
      <div className="mx-auto w-full max-w-2xl pb-12 sm:pb-16">
        <PageHeader title="Account" />
        <div className="mt-6 sm:mt-8">
          {isConvexConfigured ? (
            <AccountAccess account={account} />
          ) : (
            <p className="account-access px-5 py-5 text-sm text-muted-foreground">
              Account access is available on the live app. Your local changes are saved on this
              device.
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
