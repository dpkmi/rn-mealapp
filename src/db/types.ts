import type { InferSelectModel } from "drizzle-orm";
import { categories, mealIngredients, meals, mealSteps } from "./schema";

export type Category = InferSelectModel<typeof categories>;
export type Meal = InferSelectModel<typeof meals>;
export type MealIngredient = InferSelectModel<typeof mealIngredients>;
export type MealStep = InferSelectModel<typeof mealSteps>;
