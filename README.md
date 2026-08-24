# Lotus Wealth 🪷

Lotus Wealth is a full-stack budget tracker and wealth planner built with TanStack Start, React, Tailwind CSS, Convex, and Vercel.

## What It Does

- Tracks income, expenses, needs vs. wants, savings, investments, and goals.
- Syncs signed-in budget data to Convex.
- Uses Convex Auth for email/password accounts.
- Includes Convex tables for profiles, expenses, goals, recurring bills, and transactions.
- Builds for Vercel and is ready for GitHub-connected CI/CD.

See [docs/application-plan.md](docs/application-plan.md) for the full product roadmap.

## Development

```sh
npm install
npm run dev
```

Create or select a Convex deployment:

```sh
npm run convex:dev
```

Build for production:

```sh
npm run build
```

## Environment

- `VITE_CONVEX_URL`: Convex client URL for the target environment.
- `VITE_CONVEX_SITE_URL`: Convex HTTP actions URL.
- Convex Auth also requires `JWT_PRIVATE_KEY` and `JWKS` to be set on the Convex deployment.

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS
- Convex
- Vercel
