import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

const category = v.union(
  v.literal("Rent & bills"),
  v.literal("Groceries"),
  v.literal("Beauty"),
  v.literal("Fashion"),
  v.literal("Fun & food"),
  v.literal("Transport"),
  v.literal("Subscriptions"),
  v.literal("Other"),
);

const defaults = {
  name: "bestie",
  income: 4200,
  savingsRate: 20,
  investRate: 15,
  startingInvested: 3500,
  returnRate: 8,
  years: 20,
  noBuyStreak: 12,
};

async function requireUser(ctx: MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new Error("Sign in to manage your budget.");
  return userId as Id<"users">;
}

async function ensureProfile(ctx: MutationCtx, userId: Id<"users">) {
  const existing = await ctx.db
    .query("budgetProfiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
  if (existing) return existing as Doc<"budgetProfiles">;

  const id = await ctx.db.insert("budgetProfiles", {
    userId,
    ...defaults,
    updatedAt: Date.now(),
  });
  return (await ctx.db.get(id)) as Doc<"budgetProfiles">;
}

export const snapshot = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const user = await ctx.db.get(userId);
    const profile = await ctx.db
      .query("budgetProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) return null;
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const goals = await ctx.db
      .query("goals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const recurringBills = await ctx.db
      .query("recurringBills")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(60);
    return {
      account: {
        email: user?.email,
        name: user?.name,
        createdAt: user?._creationTime,
      },
      profile,
      expenses,
      goals,
      recurringBills,
      transactions,
    };
  },
});

export const seed = mutation({
  args: {
    expenses: v.array(
      v.object({
        name: v.string(),
        amount: v.number(),
        category,
        essential: v.boolean(),
      }),
    ),
    goals: v.array(
      v.object({
        name: v.string(),
        target: v.number(),
        saved: v.number(),
        emoji: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    await ensureProfile(ctx, userId);
    const existingExpenses = await ctx.db
      .query("expenses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!existingExpenses) {
      for (const expense of args.expenses) {
        await ctx.db.insert("expenses", {
          userId,
          ...expense,
          date: new Date().toISOString().slice(0, 10),
          updatedAt: Date.now(),
        });
      }
    }
    const existingGoals = await ctx.db
      .query("goals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!existingGoals) {
      for (const goal of args.goals) {
        await ctx.db.insert("goals", { userId, ...goal, updatedAt: Date.now() });
      }
    }
  },
});

export const updateProfile = mutation({
  args: {
    patch: v.object({
      name: v.optional(v.string()),
      income: v.optional(v.number()),
      savingsRate: v.optional(v.number()),
      investRate: v.optional(v.number()),
      startingInvested: v.optional(v.number()),
      returnRate: v.optional(v.number()),
      years: v.optional(v.number()),
      noBuyStreak: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const profile = await ensureProfile(ctx, userId);
    await ctx.db.patch(profile._id, { ...args.patch, updatedAt: Date.now() });
  },
});

export const replaceState = mutation({
  args: {
    state: v.object({
      name: v.string(),
      income: v.number(),
      savingsRate: v.number(),
      investRate: v.number(),
      startingInvested: v.number(),
      returnRate: v.number(),
      years: v.number(),
      noBuyStreak: v.number(),
      expenses: v.array(
        v.object({
          id: v.string(),
          name: v.string(),
          amount: v.number(),
          category,
          essential: v.boolean(),
        }),
      ),
      goals: v.array(
        v.object({
          id: v.string(),
          name: v.string(),
          target: v.number(),
          saved: v.number(),
          emoji: v.string(),
        }),
      ),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const profile = await ensureProfile(ctx, userId);
    const now = Date.now();
    await ctx.db.patch(profile._id, {
      name: args.state.name,
      income: args.state.income,
      savingsRate: args.state.savingsRate,
      investRate: args.state.investRate,
      startingInvested: args.state.startingInvested,
      returnRate: args.state.returnRate,
      years: args.state.years,
      noBuyStreak: args.state.noBuyStreak,
      updatedAt: now,
    });

    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const expense of expenses) await ctx.db.delete(expense._id);
    for (const expense of args.state.expenses) {
      await ctx.db.insert("expenses", {
        userId,
        name: expense.name,
        amount: expense.amount,
        category: expense.category,
        essential: expense.essential,
        date: new Date().toISOString().slice(0, 10),
        updatedAt: now,
      });
    }

    const goals = await ctx.db
      .query("goals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const goal of goals) await ctx.db.delete(goal._id);
    for (const goal of args.state.goals) {
      await ctx.db.insert("goals", {
        userId,
        name: goal.name,
        target: goal.target,
        saved: goal.saved,
        emoji: goal.emoji,
        updatedAt: now,
      });
    }
  },
});

export const addExpense = mutation({
  args: { name: v.string(), amount: v.number(), category, essential: v.boolean() },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    await ctx.db.insert("expenses", {
      userId,
      ...args,
      date: new Date().toISOString().slice(0, 10),
      updatedAt: Date.now(),
    });
  },
});

export const updateExpense = mutation({
  args: {
    id: v.id("expenses"),
    patch: v.object({
      name: v.optional(v.string()),
      amount: v.optional(v.number()),
      category: v.optional(category),
      essential: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const expense = await ctx.db.get(args.id);
    if (!expense || expense.userId !== userId) throw new Error("Expense not found.");
    await ctx.db.patch(args.id, { ...args.patch, updatedAt: Date.now() });
  },
});

export const removeExpense = mutation({
  args: { id: v.id("expenses") },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const expense = await ctx.db.get(args.id);
    if (!expense || expense.userId !== userId) throw new Error("Expense not found.");
    await ctx.db.delete(args.id);
  },
});

export const addGoal = mutation({
  args: { name: v.string(), target: v.number(), saved: v.number(), emoji: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    await ctx.db.insert("goals", { userId, ...args, updatedAt: Date.now() });
  },
});

export const fundGoal = mutation({
  args: { id: v.id("goals"), amount: v.number() },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const goal = await ctx.db.get(args.id);
    if (!goal || goal.userId !== userId) throw new Error("Goal not found.");
    await ctx.db.patch(args.id, {
      saved: Math.max(0, goal.saved + args.amount),
      updatedAt: Date.now(),
    });
  },
});

export const removeGoal = mutation({
  args: { id: v.id("goals") },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const goal = await ctx.db.get(args.id);
    if (!goal || goal.userId !== userId) throw new Error("Goal not found.");
    await ctx.db.delete(args.id);
  },
});
