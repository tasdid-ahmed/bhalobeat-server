import "dotenv/config";
import { MongoClient, type Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || "bhalobeat";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is missing from environment variables.");
}

const client = new MongoClient(MONGODB_URI);
let connection: Promise<MongoClient> | null = null;

// Connects once and reuses the connection (works for local and Vercel).
export async function getDb(): Promise<Db> {
  if (!connection) {
    connection = client.connect().catch((error) => {
      connection = null;
      throw error;
    });
  }
  await connection;
  return client.db(DB_NAME);
}