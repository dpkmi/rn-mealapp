import {
  sqliteTable,
  text,
  integer,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  color: text("color").notNull(),
});

export const meals = sqliteTable("meals", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  affordability: text("affordability", {
    enum: ["affordable", "pricey", "luxurious"],
  }).notNull(),
  complexity: text("complexity", {
    enum: ["simple", "challenging", "hard"],
  }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  duration: integer("duration").notNull(),
  isGlutenFree: integer("isGlutenFree", { mode: "boolean" }).notNull(),
  isVegan: integer("isVegan", { mode: "boolean" }).notNull(),
  isVegetarian: integer("isVegetarian", { mode: "boolean" }).notNull(),
  isLactoseFree: integer("isLactoseFree", { mode: "boolean" }).notNull(),
});

export const mealsToCategories = sqliteTable(
  "meals_to_categories",
  (c) => ({
    mealId: c
      .text("mealId")
      .notNull()
      .references(() => meals.id, { onDelete: "cascade" }),
    categoryId: c
      .text("categoryId")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.mealId, t.categoryId] }),
  })
);

export const mealIngredients = sqliteTable(
  "meal_ingredients", // (kleine naming tweak)
  (c) => ({
    mealId: c
      .text("mealId")
      .notNull()
      .references(() => meals.id, { onDelete: "cascade" }),
    order: c.integer("order").notNull(),
    text: c.text("text").notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.mealId, t.order] }),
  })
);

export const mealSteps = sqliteTable(
  "meal_steps",
  (c) => ({
    mealId: c
      .text("mealId")
      .notNull()
      .references(() => meals.id, { onDelete: "cascade" }),
    order: c.integer("order").notNull(),
    text: c.text("text").notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.mealId, t.order] }),
  })
);

export const mealsRelations = relations(meals, ({ many }) => ({
  categories: many(mealsToCategories),
  ingredients: many(mealIngredients),
  steps: many(mealSteps),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  meals: many(mealsToCategories),
}));
