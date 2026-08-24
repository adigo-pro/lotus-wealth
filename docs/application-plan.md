# Bloom Wealth Application Plan

Bloom Wealth is now structured as a real full-stack budgeting app: React/TanStack on the frontend, Convex for auth and user-owned data, GitHub for source control, and Vercel for CI/CD.

## Implemented

- Lotus-branded Bloom Wealth UI and favicon.
- Convex project with separate development and production deployments.
- Convex Auth email/password configuration.
- User-scoped data model for profiles, expenses, goals, recurring bills, and transactions.
- React data layer that syncs budget edits to Convex when `VITE_CONVEX_URL` is configured.
- Cashflow and build-plan views so the app is no longer just a one-page calculator.

## Next Build Phases

1. Accounts: add profile settings, password reset email, optional OAuth, and account deletion/export.
2. Budgeting: add monthly budgets, category caps, recurring bill reminders, and transaction review flows.
3. Goals: add deadlines, contribution schedules, savings history, and emergency fund health checks.
4. Insights: add trend charts, subscription audits, no-buy challenges, and monthly reports.
5. Imports: add CSV upload first, then bank sync once financial provider credentials are selected.
6. Production hardening: add Playwright smoke tests, analytics, error reporting, and environment promotion rules.
