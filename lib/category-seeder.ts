import { db } from "@/lib/db";
import { categories } from "@/lib/categories";

export async function seedCategories() {
  const results = [];

  for (const category of categories) {
    const result = await db.category.upsert({
      where: {
        slug: category.slug
      },
      update: {
        name: category.nameHi
      },
      create: {
        name: category.nameHi,
        slug: category.slug,
        description: `${category.nameHi} की ताज़ा खबरें`
      }
    });

    results.push(result);
  }

  return results;
}
