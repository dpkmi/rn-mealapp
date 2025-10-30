import { getRawDb } from "./client";
import { db } from "./client";
import { sql } from "drizzle-orm";
import {
  categories,
  meals,
  mealsToCategories,
  mealIngredients,
  mealSteps,
} from "./schema";
import { CATEGORIES, MEALS } from "../../data/dummy-data";

let isBootstrapping = false;
let bootstrapPromise: Promise<void> | null = null;

export async function ensureSchemaAndSeed() {
  // If already bootstrapping, return the same promise
  if (isBootstrapping && bootstrapPromise) {
    return bootstrapPromise;
  }

  isBootstrapping = true;

  const doBootstrap = async () => {
    try {
      const sqlite = getRawDb();

      await sqlite.execAsync(`
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          color TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS meals (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          affordability TEXT NOT NULL,
          complexity TEXT NOT NULL,
          imageUrl TEXT NOT NULL,
          duration INTEGER NOT NULL,
          isGlutenFree INTEGER NOT NULL,
          isVegan INTEGER NOT NULL,
          isVegetarian INTEGER NOT NULL,
          isLactoseFree INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS meals_to_categories (
          mealId TEXT NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
          categoryId TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
          PRIMARY KEY (mealId, categoryId)
        );

        CREATE TABLE IF NOT EXISTS meal_ingredients (
          mealId TEXT NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
          "order" INTEGER NOT NULL,
          text TEXT NOT NULL,
          PRIMARY KEY (mealId, "order")
        );

        CREATE TABLE IF NOT EXISTS meal_steps (
          mealId TEXT NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
          "order" INTEGER NOT NULL,
          text TEXT NOT NULL,
          PRIMARY KEY (mealId, "order")
        );
      `);

      // Check if data already exists
      const result = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(categories);

      const count = result[0]?.count ?? 0;
      if (count > 0) return;

      // --- Seed Categories ---
      const catRows: (typeof categories.$inferInsert)[] = CATEGORIES.map(
        (c: any) => ({
          id: c.id,
          title: c.title,
          color: c.color,
        })
      );
      await db.insert(categories).values(catRows);

      // --- Seed Meals ---
      const mealRows: (typeof meals.$inferInsert)[] = (MEALS as any[]).map(
        (m) => ({
          id: m.id,
          title: m.title,
          affordability: m.affordability,
          complexity: m.complexity,
          imageUrl: m.imageUrl,
          duration: m.duration,
          isGlutenFree: Boolean(m.isGlutenFree),
          isVegan: Boolean(m.isVegan),
          isVegetarian: Boolean(m.isVegetarian),
          isLactoseFree: Boolean(m.isLactoseFree),
        })
      );
      await db.insert(meals).values(mealRows);

      // --- Meals to Categories junction table ---
      const m2cRows: (typeof mealsToCategories.$inferInsert)[] = (
        MEALS as any[]
      ).flatMap((m) =>
        (Array.isArray(m.categoryIds) ? m.categoryIds : []).map(
          (cid: string) => ({
            mealId: m.id,
            categoryId: cid,
          })
        )
      );
      if (m2cRows.length) {
        await db.insert(mealsToCategories).values(m2cRows);
      }

      // --- Ingredients ---
      const ingredientRows: (typeof mealIngredients.$inferInsert)[] = (
        MEALS as any[]
      ).flatMap((m) =>
        (Array.isArray(m.ingredients) ? m.ingredients : []).map(
          (t: string, i: number) => ({ mealId: m.id, order: i, text: t })
        )
      );
      if (ingredientRows.length) {
        await db.insert(mealIngredients).values(ingredientRows);
      }

      // --- Steps ---
      const stepRows: (typeof mealSteps.$inferInsert)[] = (
        MEALS as any[]
      ).flatMap((m) =>
        (Array.isArray(m.steps) ? m.steps : []).map((t: string, i: number) => ({
          mealId: m.id,
          order: i,
          text: t,
        }))
      );
      if (stepRows.length) {
        await db.insert(mealSteps).values(stepRows);
      }
    } finally {
      isBootstrapping = false;
    }
  };

  bootstrapPromise = doBootstrap();
  return bootstrapPromise;
}
