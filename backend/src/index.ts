import { AppDataSource } from "./config/database";

AppDataSource.initialize()
  .then(() => {
    console.log("PostgreSQL connected successfully!");
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });