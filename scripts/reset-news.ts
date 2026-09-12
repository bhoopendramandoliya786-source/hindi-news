import { db } from "../lib/db";

async function main() {
  const deleted = await db.news.deleteMany({});
  console.log(`Reset complete: deleted ${deleted.count} news rows.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
