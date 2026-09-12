import { saveIndiaNews } from "../lib/news-saver";

saveIndiaNews()
  .then((result) => {
    console.log(JSON.stringify(result));
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
