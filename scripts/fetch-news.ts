import { seedCategories } from "../lib/category-seeder";
import { saveIndiaNews } from "../lib/news-saver";

Promise.resolve()
  .then(() => seedCategories())
  .then(() => saveIndiaNews())
  .then((result) => {
    console.log(JSON.stringify(result));
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
