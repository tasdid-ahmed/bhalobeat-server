import type { Request, Response } from "express";
import { eventsCollection } from "../config/collections.js";
import { toPublicEvent } from "../utils/serialize.js";
import { parseObjectId, startOfToday } from "../utils/validation.js";

const MAX_EVENTS = 100;

export async function getUpcomingEvents(req: Request, res: Response): Promise<void> {
  try {
    const requested = Number(req.query.limit);
    const limit =
      Number.isInteger(requested) && requested > 0
        ? Math.min(requested, MAX_EVENTS)
        : MAX_EVENTS;

    const events = await eventsCollection();
    const data = await events
      .find({ date: { $gte: startOfToday() } })
      .sort({ date: 1, createdAt: -1 })
      .limit(limit)
      .toArray();

    res.json({ success: true, data: data.map(toPublicEvent) });
  } catch (error) {
    console.error("getUpcomingEvents failed:", error);
    res.status(500).json({ success: false, message: "Could not load events. Please try again." });
  }
}

export async function getEventById(req: Request, res: Response): Promise<void> {
  const id = parseObjectId(req.params.id);
  if (!id) {
    res.status(400).json({ success: false, message: "Invalid event ID." });
    return;
  }

  try {
    const events = await eventsCollection();
    const event = await events.findOne({ _id: id });

    if (!event) {
      res.status(404).json({ success: false, message: "Event not found." });
      return;
    }

    res.json({ success: true, data: toPublicEvent(event) });
  } catch (error) {
    console.error("getEventById failed:", error);
    res.status(500).json({ success: false, message: "Could not load the event. Please try again." });
  }
}