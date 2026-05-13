import "dotenv/config";
import express from "express";
import db from "./db/db.config.js";
import { errorHandler } from "./middleware/error-handler.js";
import mainRouter from "./api/main.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use("/api", mainRouter);
app.use(errorHandler);







async function startServer() {
  try {
    const connection = await db.getConnection();
    connection.release();
    console.log(" connected to the database");
  } catch (error) {
    console.error("Error connecting DB (continuing):", error.message);
  }

  app.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer();
