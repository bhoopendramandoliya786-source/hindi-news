import { db } from "@/lib/db";
import { categories } from "@/lib/categories";

export async function seedCategories() {
  const activeSlugs = categories.map((category) => category.slug);

  // Remove the old general-news taxonomy and its dependent news records.
  await db.category.deleteMany({
    where: { slug: { notIn: activeSlugs } },
  });

  const results = [];
  for (const category of categories) {
    const result = await db.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.nameHi,
        description: `${category.nameHi} से जुड़ी छात्र उपयोगी जानकारी और आधिकारिक अपडेट`,
      },
      create: {
        name: category.nameHi,
        slug: category.slug,
        description: `${category.nameHi} से जुड़ी छात्र उपयोगी जानकारी और आधिकारिक अपडेट`,
      },
    });
    results.push(result);
  }

  return results;
}
