import type { Request, Response } from "express";
import { eventsCollection, joinedEventsCollection } from "../config/collections.js";
import type { AuthUser } from "../middleware/verify-jwt.js";
import { parseEventInput, parseObjectId } from "../utils/validation.js";

export async function getMyEvents(_req: Request, res: Response): Promise<void> {
  const user = res.locals.user as AuthUser;

  try {
    const events = await eventsCollection();
    const data = await events
      .find({ creatorEmail: user.email })
      .sort({ date: 1 })
      .toArray();

    res.json({ success: true, data });
  } catch (error) {
    console.error("getMyEvents failed:", error);
    res.status(500).json({ success: false, message: "Could not load your events. Please try again." });
  }
}

export async function updateEvent(req: Request, res: Response): Promise<void> {
  const user = res.locals.user as AuthUser;
  const id = parseObjectId(req.params.id);

  if (!id) {
    res.status(400).json({ success: false, message: "Invalid event ID." });
    return;
  }

  const parsed = parseEventInput(req.body);
  if (!parsed.ok) {
    res.status(400).json({ success: false, message: parsed.message });
    return;
  }

  try {
    const events = await eventsCollection();
    const existing = await events.findOne({ _id: id });

    if (!existing) {
      res.status(404).json({ success: false, message: "Event not found." });
      return;
    }
    if (existing.creatorEmail !== user.email) {
      res.status(403).json({ success: false, message: "You can only update your own events." });
      return;
    }

    await events.updateOne(
      { _id: id, creatorEmail: user.email },
      { $set: { ...parsed.data, updatedAt: new Date() } }
    );

    const updated = await events.findOne({ _id: id });
    res.json({ success: true, message: "Event updated successfully.", data: updated });
  } catch (error) {
    console.error("updateEvent failed:", error);
    res.status(500).json({ success: false, message: "Could not update the event. Please try again." });
  }
}

export async function deleteEvent(req: Request, res: Response): Promise<void> {
  const user = res.locals.user as AuthUser;
  const id = parseObjectId(req.params.id);

  if (!id) {
    res.status(400).json({ success: false, message: "Invalid event ID." });
    return;
  }

  try {
    const events = await eventsCollection();
    const existing = await events.findOne({ _id: id });

    if (!existing) {
      res.status(404).json({ success: false, message: "Event not found." });
      return;
    }
    if (existing.creatorEmail !== user.email) {
      res.status(403).json({ success: false, message: "You can only delete your own events." });
      return;
    }

    await events.deleteOne({ _id: id, creatorEmail: user.email });

    const joined = await joinedEventsCollection();
    await joined.deleteMany({ eventId: id });

    res.json({ success: true, message: "Event deleted successfully." });
  } catch (error) {
    console.error("deleteEvent failed:", error);
    res.status(500).json({ success: false, message: "Could not delete the event. Please try again." });
  }
}