import pg, { Query } from "pg";
const { Client } = pg;

const createTableQuery = `CREATE TABLE repositories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  owner TEXT NOT NULL,
  stars INTEGER NOT NULL,
  fetched_at TIMESTAMP DEFAULT NOW()
);
`;

const client = new Client({
  host: process.env.PGHOST || "localhost",
  port: process.env.PGPORT || 5432,
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "postgres",
  database: process.env.PGDATABASE || "postgres",
});

const setupDB = async () => {
  await client.connect();
  await client.query(createTableQuery);
  console.log("✅ Table created successfully!");
  await client.end();
};

setupDB().catch(console.error);
