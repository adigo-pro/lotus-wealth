import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import { Link } from "@tanstack/react-router";
import { LogOut, Lock } from "lucide-react";
import { useState } from "react";
import type { AccountInfo } from "@/lib/budget-store";

function joinedDate(account: AccountInfo) {
  if (!account?.createdAt) return "Joined recently";
  return `Joined ${new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(account.createdAt))}`;
}

export function AccountAccess({
  account,
  compact = false,
}: {
  account: AccountInfo;
  compact?: boolean;
}) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const [step, setStep] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState("");

  if (isLoading)
    return (
      <div className="account-access px-5 py-4 text-sm text-muted-foreground">
        Opening your account...
      </div>
    );
  if (isAuthenticated) {
    return (
      <section
        className={`account-access grid gap-4 px-5 py-5 sm:grid-cols-[1fr_auto] sm:items-center ${compact ? "mb-4" : ""}`}
      >
        <div>
          <p className="text-sm font-semibold">Your account</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {account?.email ?? account?.name ?? "Signed in"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {joinedDate(account)} · Changes saved automatically
          </p>
        </div>
        <button
          onClick={() => void signOut()}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </section>
    );
  }
  if (compact) {
    return (
      <section className="account-access grid gap-4 px-5 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="text-sm font-semibold">Keep your plan with you</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create an account to save your changes.
          </p>
        </div>
        <Link
          to="/account"
          className="primary-button inline-flex justify-center px-4 py-2.5 text-sm font-semibold"
        >
          Sign in or create account
        </Link>
      </section>
    );
  }
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setError("");
        void signIn("password", new FormData(event.currentTarget)).catch((reason) =>
          setError(reason instanceof Error ? reason.message : "Could not continue."),
        );
      }}
      className="account-form max-w-xl"
    >
      <div className="grid gap-5">
        <label>
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Email
          </span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-2 w-full border-b border-border bg-transparent py-3 outline-none focus:border-primary"
          />
        </label>
        <label>
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Password
          </span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={step === "signIn" ? "current-password" : "new-password"}
            className="mt-2 w-full border-b border-border bg-transparent py-3 outline-none focus:border-primary"
          />
        </label>
        <input name="flow" type="hidden" value={step} />
      </div>
      {error ? <p className="mt-4 text-sm font-semibold text-destructive">{error}</p> : null}
      <div className="mt-7 flex flex-wrap items-center gap-4">
        <button className="primary-button inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold">
          <Lock className="size-4" /> {step === "signIn" ? "Sign in" : "Create account"}
        </button>
        <button
          type="button"
          onClick={() => {
            setError("");
            setStep(step === "signIn" ? "signUp" : "signIn");
          }}
          className="text-sm font-semibold text-muted-foreground hover:text-primary"
        >
          {step === "signIn" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </form>
  );
}
