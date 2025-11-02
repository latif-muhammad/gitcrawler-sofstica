import { client, setupDB } from "./database/setup-db.js";
import { fetchRepositories } from "./crawler/crawler.js";

let totalFetched = 0;
const TARGET = 100000;

const starSegments = [
  "stars:>50000",
  "stars:20000..49999",
  "stars:10000..19999",
  "stars:5000..9999",
  "stars:2000..4999",
  "stars:1000..1999",
  "stars:500..999",
  "stars:200..499",
  "stars:100..199",
  "stars:50..99",
  "stars:10..49",
  "stars:1..9",
];

const app = async () => {
  try {
    await setupDB();
    for (const segment of starSegments) {
      if (totalFetched >= TARGET) break;
      console.log(`\nFetching repos for segment: ${segment}`);
      const repos = await fetchRepositories(segment, 1000, 100);
      totalFetched += repos.length;
      console.log(`Fetched ${repos.length} repos for segment: ${segment}`);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 2 seconds

    }
    console.log(repos);
    await client.end();
  } catch (error) {
    console.log("Error in app:", error);
  }
};

app();
