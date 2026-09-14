import { seedCategories } from "../lib/category-seeder";
import { saveIndiaNews } from "../lib/news-saver";
import { syncCentralOfficialNews } from "../lib/central-news-sync";

Promise.resolve()
  .then(() => seedCategories())
  .then(async () => {
    // Run both official monitoring layers in the same scheduled job so the
    // automatic system does not leave central updates waiting for a separate
    // daily Vercel cron. Both savers are dedupe-safe.
    const [rajasthan, central] = await Promise.allSettled([
      saveIndiaNews(),
      syncCentralOfficialNews(),
    ]);

    const result = {
      rajasthan: rajasthan.status === "fulfilled" ? rajasthan.value : { error: String(rajasthan.reason) },
      central: central.status === "fulfilled" ? central.value : { error: String(central.reason) },
    };

    if (rajasthan.status === "rejected" && central.status === "rejected") {
      throw new Error(`Both official sync layers failed: ${String(rajasthan.reason)} | ${String(central.reason)}`);
    }

    console.log(JSON.stringify(result));
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
