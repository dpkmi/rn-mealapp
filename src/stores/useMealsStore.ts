import { create } from "zustand";
import { db } from "../db/client";
import { categories, meals, mealsToCategories } from "../db/schema";
import type { Category as CategoryRow, Meal as MealRow } from "../db/types";
import { eq, and } from "drizzle-orm";
import { ensureSchemaAndSeed } from "../db/bootstrap";

type MealsState = {
  categories: CategoryRow[];
  mealsByCategory: Record<string, MealRow[]>;
  // loading flags
  bootstrapped: boolean;
  loadingCategories: boolean;
  loadingMeals: Record<string, boolean>;
  // errors
  error?: string;
  // actions
  init: () => Promise<void>;
  loadCategories: () => Promise<void>;
  loadMealsForCategory: (categoryId: string) => Promise<void>;
  reset: () => void;
};

export const useMealsStore = create<MealsState>((set, get) => ({
  categories: [],
  mealsByCategory: {},
  bootstrapped: false,
  loadingCategories: false,
  loadingMeals: {},
  init: async () => {
    if (get().bootstrapped) return;
    try {
      await ensureSchemaAndSeed();
      set({ bootstrapped: true });
    } catch (error: any) {
      console.error("❌ Database initialization failed:", error);
      set({ error: error.message });
    }
  },
  loadCategories: async () => {
    set({ loadingCategories: true, error: undefined });
    try {
      const rows = await db.select().from(categories);
      set({ categories: rows, loadingCategories: false });
    } catch (error: any) {
      set({ error: error.message, loadingCategories: false });
    }
  },

  loadMealsForCategory: async (categoryId: string) => {
    const loadingMeals = { ...get().loadingMeals, [categoryId]: true };
    set({ loadingMeals, error: undefined });
    try {
      const rows = await db
        .select({ m: meals })
        .from(meals)
        .innerJoin(
          mealsToCategories,
          and(
            eq(mealsToCategories.mealId, meals.id),
            eq(mealsToCategories.categoryId, categoryId)
          )
        );

      const onlyMeals: MealRow[] = rows.map((r) => r.m);
      set({
        mealsByCategory: { ...get().mealsByCategory, [categoryId]: onlyMeals },
      });
    } catch (e: any) {
      set({ error: String(e) });
    } finally {
      const lm = { ...get().loadingMeals };
      delete lm[categoryId];
      set({ loadingMeals: lm });
    }
  },

  reset: () =>
    set({
      categories: [],
      mealsByCategory: {},
      bootstrapped: false,
      loadingCategories: false,
      loadingMeals: {},
      error: undefined,
    }),
}));
