import { client, setupDB } from "./database/setup-db.js";
import { fetchRepositories } from "./crawler/crawler.js";

let totalFetched = 0;
const TARGET = 100000;

const timeSegments = [
  // Recent months (2024)
  "created:2024-01-01..2024-01-31",
  "created:2024-02-01..2024-02-29", 
  "created:2024-03-01..2024-03-31",
  "created:2024-04-01..2024-04-30",
  "created:2024-05-01..2024-05-31",
  "created:2024-06-01..2024-06-30",
  "created:2024-07-01..2024-07-31",
  "created:2024-08-01..2024-08-31",
  "created:2024-09-01..2024-09-30",
  "created:2024-10-01..2024-10-31",
  "created:2024-11-01..2024-11-30",
  "created:2024-12-01..2024-12-31",

  // 2023 - by month
  "created:2023-01-01..2023-01-31",
  "created:2023-02-01..2023-02-28",
  "created:2023-03-01..2023-03-31",
  "created:2023-04-01..2023-04-30",
  "created:2023-05-01..2023-05-31",
  "created:2023-06-01..2023-06-30",
  "created:2023-07-01..2023-07-31",
  "created:2023-08-01..2023-08-31",
  "created:2023-09-01..2023-09-30",
  "created:2023-10-01..2023-10-31",
  "created:2023-11-01..2023-11-30",
  "created:2023-12-01..2023-12-31",

  // 2022 - by quarter
  "created:2022-01-01..2022-03-31",
  "created:2022-04-01..2022-06-30",
  "created:2022-07-01..2022-09-30",
  "created:2022-10-01..2022-12-31",

  // 2021 - by quarter
  "created:2021-01-01..2021-03-31",
  "created:2021-04-01..2021-06-30",
  "created:2021-07-01..2021-09-30",
  "created:2021-10-01..2021-12-31",

  // 2020 - by quarter
  "created:2020-01-01..2020-03-31",
  "created:2020-04-01..2020-06-30",
  "created:2020-07-01..2020-09-30",
  "created:2020-10-01..2020-12-31",

  // 2019 - by quarter
  "created:2019-01-01..2019-03-31",
  "created:2019-04-01..2019-06-30",
  "created:2019-07-01..2019-09-30",
  "created:2019-10-01..2019-12-31",

  // 2018 - by quarter
  "created:2018-01-01..2018-03-31",
  "created:2018-04-01..2018-06-30",
  "created:2018-07-01..2018-09-30",
  "created:2018-10-01..2018-12-31",

  // 2017 - by half year
  "created:2017-01-01..2017-06-30",
  "created:2017-07-01..2017-12-31",

  // 2016 - by half year
  "created:2016-01-01..2016-06-30",
  "created:2016-07-01..2016-12-31",

  // 2015 - by half year
  "created:2015-01-01..2015-06-30",
  "created:2015-07-01..2015-12-31",

  // 2014 - by year
  "created:2014-01-01..2014-12-31",

  // 2013 - by year
  "created:2013-01-01..2013-12-31",

  // 2012 - by year
  "created:2012-01-01..2012-12-31",

  // 2011 - by year
  "created:2011-01-01..2011-12-31",

  // 2010 - by year
  "created:2010-01-01..2010-12-31",

  // 2009 and before - grouped
  "created:2009-01-01..2009-12-31",
  "created:2008-01-01..2008-12-31",
  "created:2007-01-01..2007-12-31",

  // Combined with different sort orders
  "created:>2023-01-01 sort:stars-desc",
  "created:>2023-01-01 sort:updated-desc",
  "created:>2023-01-01 sort:forks-desc",
  "created:>2023-01-01 sort:name-asc",

  "created:2020-01-01..2022-12-31 sort:stars-desc",
  "created:2020-01-01..2022-12-31 sort:updated-desc",
  "created:2020-01-01..2022-12-31 sort:forks-desc",

  "created:2015-01-01..2019-12-31 sort:stars-desc", 
  "created:2015-01-01..2019-12-31 sort:updated-desc",
  "created:2015-01-01..2019-12-31 sort:forks-desc",

  "created:<2015-01-01 sort:stars-desc",
  "created:<2015-01-01 sort:updated-desc",
  "created:<2015-01-01 sort:forks-desc",

  // Last updated time ranges
  "pushed:>2024-01-01",
  "pushed:2023-10-01..2023-12-31",
  "pushed:2023-07-01..2023-09-30",
  "pushed:2023-04-01..2023-06-30",
  "pushed:2023-01-01..2023-03-31",
  "pushed:2022-07-01..2022-12-31",
  "pushed:2022-01-01..2022-06-30",
  "pushed:2021-07-01..2021-12-31",
  "pushed:2021-01-01..2021-06-30",
  "pushed:2020-07-01..2020-12-31",
  "pushed:2020-01-01..2020-06-30",
  "pushed:2019-01-01..2019-12-31",
  "pushed:2018-01-01..2018-12-31",
  "pushed:2017-01-01..2017-12-31",
  "pushed:2016-01-01..2016-12-31",
  "pushed:2015-01-01..2015-12-31",
  "pushed:<2015-01-01",

  // Combined created and updated
  "created:>2022-01-01 pushed:>2023-01-01",
  "created:2020-01-01..2021-12-31 pushed:>2022-01-01",
  "created:2018-01-01..2019-12-31 pushed:>2020-01-01",
  "created:2016-01-01..2017-12-31 pushed:>2018-01-01",
  "created:<2016-01-01 pushed:>2016-01-01",

  // Seasonal patterns (historically active months)
  "created:2023-09-01..2023-11-30", // Fall semester
  "created:2023-03-01..2023-05-31", // Spring semester
  "created:2022-09-01..2022-11-30",
  "created:2022-03-01..2022-05-31",
  "created:2021-09-01..2021-11-30",
  "created:2021-03-01..2021-05-31",

  // GitHub's major milestone years
  "created:2018-01-01..2018-12-31", // GitHub acquired by Microsoft
  "created:2020-01-01..2020-12-31", // Pandemic coding boom
  "created:2022-01-01..2022-12-31", // AI/ML explosion

  // Pre-GitHub era (very old repos)
  "created:2008-01-01..2008-12-31", // GitHub founding year
  "created:<2008-01-01" // Pre-GitHub repositories
];


const app = async () => {
  try {
    await setupDB();
    for (const segment of timeSegments) {
      if (totalFetched >= TARGET) break;
      console.log(`\nFetching repos for segment: ${segment}`);
      const repos = await fetchRepositories(segment, 1000, 100);
      totalFetched += repos.length;
      console.log(`Fetched ${repos.length} repos for segment: ${segment}`);
      await new Promise((resolve) => setTimeout(resolve, 1000)); 
    }
    await client.end();
  } catch (error) {
    console.log("Error in app:", error);
  }
};

app();
