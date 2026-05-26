import "dotenv/config";
import express from "express";
import cors from "cors";
import db from "./db/db.config.js";
import { errorHandler } from "./middleware/error-handler.js";
import mainRouter from "./api/main.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(errorHandler);

// mount the main router
app.use("/api", mainRouter);


/**
 * Starts the server and tests the database connection.
 * @returns {Promise<void>} - A promise that resolves when the server is started and the database 
 * connection is tested. May reject with an error if the database connection fails.
 */

async function startServer() {
  try {
    // test connection to the database
    const connection = await db.getConnection();
    // release the connection after the test is done 
    connection.release();
    console.log("Successfully connected to the database");
  } catch (error) {
    console.error("Error connecting DB (continuing):", error.message);
  }

  app.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}
startServer();
