import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const client = axios.create({
  baseURL: "https://api.github.com/graphql",
  headers: {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    "Content-Type": "application/json",
  },
});

const fetchRepositories = async (limit, batchSize) => {
  let hasNextPage = true;
  let endCursor = null;
  let allRepos = [];

  while (hasNextPage && allRepos.length < limit) {
    const query = `
      query ($cursor: String) {
        search(query: "stars:>0", type: REPOSITORY, first: ${batchSize}, after: $cursor) {
          pageInfo {
            endCursor
            hasNextPage
          }
          edges {
            node {
              ... on Repository {
                name
                owner { login }
                stargazerCount
              }
            }
          }
        }
        rateLimit {
          cost
          remaining
          resetAt
        }
      }
    `;

    try {
      const response = await client.post("", {
        query,
        variables: { cursor: endCursor },
      });
      const data = response.data.data;

      // Extract repositories
      const repos = data.search.edges.map((edge) => edge.node);
      allRepos.push(...repos);

      console.log(`Fetched ${allRepos.length} repos so far...`);
      console.log(
        `Rate limit remaining: ${data.rateLimit.remaining}, cost: ${data.rateLimit.cost}`
      );

      hasNextPage = data.search.pageInfo.hasNextPage;
      endCursor = data.search.pageInfo.endCursor;

      // Delay 0.5s to avoid throttling
      //   await new Promise(r => setTimeout(r, 50));
    } catch (error) {
      console.error(
        "Error fetching data:",
        error.response?.data || error.message
      );
      break;
    }
  }

  return allRepos.slice(0, limit);
};

// Run
(async () => {
  const repos = await fetchRepositories(100, 100);
  console.log("\nTop Repositories:");
  repos.forEach((r) =>
    console.log(`${r.owner.login}/${r.name} ⭐ ${r.stargazerCount}`)
  );
})();
