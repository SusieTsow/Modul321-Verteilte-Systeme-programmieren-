import knex from "knex";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

// Initialize knex with database connection configuration
const db = knex({
  client: "mysql2", // Database client to use (mysql2 in this case)
  connection: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT as string), // Database port from environment variable, converted to number
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  },
});

export { db };
