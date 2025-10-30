import type { InferSelectModel } from "drizzle-orm";
import { categories, meals } from "./schema";

export type Category = InferSelectModel<typeof categories>;
export type Meal = InferSelectModel<typeof meals>;
