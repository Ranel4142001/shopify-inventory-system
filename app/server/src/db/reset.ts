import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../../../.env") });

async function reset() {
  const host = process.env.DB_HOST || "localhost";
  const port = parseInt(process.env.DB_PORT || "3306", 10);
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "";
  const database = process.env.DB_NAME || "tactile_lab";

  console.log(`Connecting to MySQL on ${host}:${port} as ${user}...`);
  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
  });

  console.log(`Dropping database ${database} if exists...`);
  await connection.query(`DROP DATABASE IF EXISTS \`${database}\``);

  console.log(`Creating database ${database}...`);
  await connection.query(`CREATE DATABASE \`${database}\``);

  await connection.end();
  console.log("Database reset complete!");
}

reset().catch((err) => {
  console.error("Reset failed:", err);
  process.exit(1);
});
