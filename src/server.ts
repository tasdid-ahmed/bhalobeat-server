import "dotenv/config";
import app from "./app.js";
import { getDb } from "./config/db.js";

const PORT = Number(process.env.PORT) || 5000;

async function start() {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`BhaloBeat API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup aborted:", error);
    process.exit(1);
  }
}

start();