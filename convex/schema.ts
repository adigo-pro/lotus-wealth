import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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

export default defineSchema({
  ...authTables,
  budgetProfiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    income: v.number(),
    savingsRate: v.number(),
    investRate: v.number(),
    startingInvested: v.number(),
    returnRate: v.number(),
    years: v.number(),
    noBuyStreak: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
  expenses: defineTable({
    userId: v.id("users"),
    name: v.string(),
    amount: v.number(),
    category,
    essential: v.boolean(),
    date: v.string(),
    note: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
  goals: defineTable({
    userId: v.id("users"),
    name: v.string(),
    target: v.number(),
    saved: v.number(),
    emoji: v.string(),
    dueDate: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
  recurringBills: defineTable({
    userId: v.id("users"),
    name: v.string(),
    amount: v.number(),
    category,
    dueDay: v.number(),
    autopay: v.boolean(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
  transactions: defineTable({
    userId: v.id("users"),
    merchant: v.string(),
    amount: v.number(),
    category,
    date: v.string(),
    type: v.union(v.literal("income"), v.literal("expense"), v.literal("transfer")),
    cleared: v.boolean(),
    updatedAt: v.number(),
  }).index("by_user", ["userId", "date"]),
});
