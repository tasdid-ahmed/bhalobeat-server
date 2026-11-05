import type { WithId } from "mongodb";
import type { EventDoc } from "../config/collections.js";

// Only the fields the public site needs. Never include creatorEmail here.
export function toPublicEvent(event: WithId<EventDoc>) {
  return {
    _id: event._id.toString(),
    title: event.title,
    description: event.description,
    type: event.type,
    thumbnail: event.thumbnail,
    location: event.location,
    date: event.date,
    creatorName: event.creatorName,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}