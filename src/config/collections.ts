import type { Collection, ObjectId } from "mongodb";
import { getDb } from "./db.js";

export type EventDoc = {
  title: string;
  description: string;
  type: string;
  thumbnail: string;
  location: string;
  date: Date;
  creatorEmail: string;
  creatorName: string;
  createdAt: Date;
  updatedAt: Date;
};

export type JoinedEventDoc = {
  eventId: ObjectId;
  userEmail: string;
  userName: string;
  joinedAt: Date;
};

let indexesReady: Promise<void> | undefined;

async function createIndexes(): Promise<void> {
  const db = await getDb();
  await Promise.all([
    db.collection("events").createIndex({ date: 1 }),
    db.collection("events").createIndex({ creatorEmail: 1 }),
    db.collection("joinedEvents").createIndex({ eventId: 1, userEmail: 1 }, { unique: true }),
    db.collection("joinedEvents").createIndex({ userEmail: 1 }),
  ]);
}

function ensureIndexes(): Promise<void> {
  indexesReady ??= createIndexes().catch((error) => {
    indexesReady = undefined;
    throw error;
  });
  return indexesReady;
}

export async function eventsCollection(): Promise<Collection<EventDoc>> {
  await ensureIndexes();
  return (await getDb()).collection<EventDoc>("events");
}

export async function joinedEventsCollection(): Promise<Collection<JoinedEventDoc>> {
  await ensureIndexes();
  return (await getDb()).collection<JoinedEventDoc>("joinedEvents");
}