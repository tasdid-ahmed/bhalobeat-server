import type { Request, Response } from "express";
import { eventsCollection } from "../config/collections.js";
import { parseObjectId, startOfTodayUTC } from "../utils/validation.js";

export async function getUpcomingEvents(req: Request, res: Response): Promise<void> {
  try {
    const requested = Number(req.query.limit);
    const limit = Number.isInteger(requested) && requested > 0 ? Math.min(requested, 50) : 0;

    const events = await eventsCollection();
    let cursor = events
      .find({ date: { $gte: startOfTodayUTC() } })
      .sort({ date: 1, createdAt: -1 });

    if (limit > 0) {
      cursor = cursor.limit(limit);
    }

    const data = await cursor.toArray();
    res.json({ success: true, data });
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

    res.json({ success: true, data: event });
  } catch (error) {
    console.error("getEventById failed:", error);
    res.status(500).json({ success: false, message: "Could not load the event. Please try again." });
  }
}