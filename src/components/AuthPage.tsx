import { AccountAccess } from "@/components/AccountAccess";
import { GuestHeader } from "@/components/AppShell";
import { isConvexConfigured } from "@/lib/budget-store";

export function AuthPage({ mode }: { mode: "signIn" | "signUp" }) {
  return (
    <main className="organic-shell mx-auto min-h-screen w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <GuestHeader />
      <section className="flex min-h-[calc(100svh-5rem)] items-center py-10">
        <div className="mx-auto w-full max-w-md">
          {isConvexConfigured ? (
            <AccountAccess account={null} initialStep={mode} useAuthRoutes />
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Account access is unavailable here.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
