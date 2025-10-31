// src/stores/useMealsStore.ts
import { create } from "zustand";
import { db } from "../db/client";
import {
  categories as categoriesTable,
  meals as mealsTable,
  mealsToCategories,
  mealIngredients as mealIngredientsTable,
  mealSteps as mealStepsTable,
} from "../db/schema";
import type { Category, Meal, MealIngredient, MealStep } from "../db/types";
import { eq, and, asc } from "drizzle-orm";
import { ensureSchemaAndSeed } from "../db/bootstrap";

type MealsState = {
  // data
  categories: Category[];
  mealsByCategory: Record<string, Meal[]>;
  mealsById: Record<string, Meal | undefined>;
  mealIngredientsById: Record<string, MealIngredient[]>;
  mealStepsById: Record<string, MealStep[]>;

  // loading flags
  bootstrapped: boolean;
  loadingCategories: boolean;
  loadingMealsByCategory: Record<string, boolean>;
  loadingMealById: Record<string, boolean>;

  // error
  error?: string;

  // actions
  init: () => Promise<void>;
  loadCategories: () => Promise<void>;
  loadMealsForCategory: (categoryId: string) => Promise<void>;
  loadMeal: (mealId: string) => Promise<void>;

  getCategoryById: (id: string) => Category | undefined;
};

export const useMealsStore = create<MealsState>((set, get) => ({
  categories: [],
  mealsByCategory: {},
  mealsById: {},
  mealIngredientsById: {},
  mealStepsById: {},

  bootstrapped: false,
  loadingCategories: false,
  loadingMealsByCategory: {},
  loadingMealById: {},

  error: undefined,

  init: async () => {
    if (get().bootstrapped) return;
    try {
      await ensureSchemaAndSeed();
      set({ bootstrapped: true });
      await get().loadCategories();
    } catch (e: any) {
      set({ error: String(e?.message ?? e) });
    }
  },

  loadCategories: async () => {
    set({ loadingCategories: true, error: undefined });
    try {
      const rows = await db.select().from(categoriesTable);
      set({ categories: rows });
    } catch (e: any) {
      set({ error: String(e?.message ?? e) });
    } finally {
      set({ loadingCategories: false });
    }
  },

  loadMealsForCategory: async (categoryId: string) => {
    const loading = { ...get().loadingMealsByCategory, [categoryId]: true };
    set({ loadingMealsByCategory: loading, error: undefined });
    try {
      const rows = await db
        .select({ m: mealsTable })
        .from(mealsTable)
        .innerJoin(
          mealsToCategories,
          and(
            eq(mealsToCategories.mealId, mealsTable.id),
            eq(mealsToCategories.categoryId, categoryId)
          )
        );
      const meals = rows.map((r) => r.m);
      set({
        mealsByCategory: { ...get().mealsByCategory, [categoryId]: meals },
      });
      // cache meteen ook per id
      const byId = { ...get().mealsById };
      for (const m of meals) byId[m.id] = m;
      set({ mealsById: byId });
    } catch (e: any) {
      set({ error: String(e) });
    } finally {
      const lm = { ...get().loadingMealsByCategory };
      delete lm[categoryId];
      set({ loadingMealsByCategory: lm });
    }
  },

  loadMeal: async (mealId: string) => {
    // skip als al bezig of al geladen (optioneel)
    if (get().loadingMealById[mealId]) {
      console.log("⏭️  Already loading meal:", mealId);
      return;
    }

    set({
      loadingMealById: { ...get().loadingMealById, [mealId]: true },
      error: undefined,
    });

    try {
      // 1) hoofdrecord
      const mealRows = await db
        .select()
        .from(mealsTable)
        .where(eq(mealsTable.id, mealId));
      const meal = mealRows[0];
      if (meal) {
        set({ mealsById: { ...get().mealsById, [mealId]: meal } });
      }

      // 2) ingrediënten (op volgorde)
      const ingredients = await db
        .select()
        .from(mealIngredientsTable)
        .where(eq(mealIngredientsTable.mealId, mealId))
        .orderBy(asc(mealIngredientsTable.order));
      set({
        mealIngredientsById: {
          ...get().mealIngredientsById,
          [mealId]: ingredients,
        },
      });

      // 3) stappen (op volgorde)
      const steps = await db
        .select()
        .from(mealStepsTable)
        .where(eq(mealStepsTable.mealId, mealId))
        .orderBy(asc(mealStepsTable.order));
      set({
        mealStepsById: {
          ...get().mealStepsById,
          [mealId]: steps,
        },
      });
    } catch (e: any) {
      console.error("❌ Error loading meal:", e);
      set({ error: String(e) });
    } finally {
      const lm = { ...get().loadingMealById };
      delete lm[mealId];
      set({ loadingMealById: lm });
    }
  },

  getCategoryById: (id) => get().categories.find((c) => c.id === id),
}));
