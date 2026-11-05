import { ObjectId } from "mongodb";

export const EVENT_TYPES = [
  "Cleanup",
  "Plantation",
  "Donation Drive",
  "Food Distribution",
  "Blood Donation",
  "Education Support",
  "Health Camp",
  "Other",
] as const;

export type EventInput = {
  title: string;
  description: string;
  type: string;
  thumbnail: string;
  location: string;
  date: Date;
};

export type ParseResult =
  | { ok: true; data: EventInput }
  | { ok: false; message: string };

// "Today" as a calendar date in Dhaka, stored as midnight UTC (the same form events use).
export function startOfToday(): Date {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(new Date());
  return new Date(`${today}T00:00:00.000Z`);
}

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function parseObjectId(value: unknown): ObjectId | null {
  return typeof value === "string" && /^[a-f\d]{24}$/i.test(value)
    ? new ObjectId(value)
    : null;
}

export function parseEventInput(body: unknown): ParseResult {
  const input = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;

  const title = asText(input.title);
  const description = asText(input.description);
  const type = asText(input.type);
  const thumbnail = asText(input.thumbnail);
  const location = asText(input.location);
  const dateText = asText(input.date).slice(0, 10);

  if (title.length < 3 || title.length > 100) {
    return { ok: false, message: "Title must be between 3 and 100 characters." };
  }
  if (description.length < 10 || description.length > 2000) {
    return { ok: false, message: "Description must be between 10 and 2000 characters." };
  }
  if (!(EVENT_TYPES as readonly string[]).includes(type)) {
    return { ok: false, message: "Please choose a valid event type." };
  }
  if (!isHttpUrl(thumbnail)) {
    return { ok: false, message: "Thumbnail must be a valid image URL starting with http:// or https://." };
  }
  if (location.length < 3 || location.length > 150) {
    return { ok: false, message: "Location must be between 3 and 150 characters." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
    return { ok: false, message: "Please provide a valid event date." };
  }

  const date = new Date(`${dateText}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== dateText) {
    return { ok: false, message: "Please provide a valid event date." };
  }
  if (date < startOfToday()) {
    return { ok: false, message: "Event date cannot be in the past." };
  }

  return { ok: true, data: { title, description, type, thumbnail, location, date } };
}