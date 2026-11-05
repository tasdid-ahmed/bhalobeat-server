import "dotenv/config";
import app from "./app.js";
import { getDb } from "./config/db.js";

const PORT = Number(process.env.PORT);

if (!PORT) {
  throw new Error("PORT is missing from the environment variables.");
}

async function start() {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");

    app.listen(PORT, () => {
      console.log(`BhaloBeat API is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup aborted:", error);
    process.exit(1);
  }
}

start();