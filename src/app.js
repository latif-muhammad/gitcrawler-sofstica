import { client, setupDB } from "./database/setup-db.js";
import { fetchRepositories } from "./crawler/crawler.js";

const app = async () => {
  try {
    await setupDB();
    const repos = await fetchRepositories(100000, 100);
    console.log("\nTop Repositories:");
    console.log(repos);
    await client.end();
  } catch (error) {
    console.log("Error in app:", error);
  }
};

app();
