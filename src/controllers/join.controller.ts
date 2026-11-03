import type { Request, Response } from "express";
import { eventsCollection, joinedEventsCollection } from "../config/collections.js";
import type { AuthUser } from "../middleware/verify-jwt.js";
import { parseObjectId, startOfTodayUTC } from "../utils/validation.js";

export async function joinEvent(req: Request, res: Response): Promise<void> {
  const user = res.locals.user as AuthUser;
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
    if (event.date < startOfTodayUTC()) {
      res.status(400).json({ success: false, message: "This event has already taken place." });
      return;
    }

    const joined = await joinedEventsCollection();
    await joined.insertOne({
      eventId: id,
      userEmail: user.email,
      userName: user.name,
      joinedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "You're in! Your beat is counted.",
    });
  } catch (error) {
    // 11000 = unique index hit: this user already joined this event.
    if ((error as { code?: number }).code === 11000) {
      res.status(409).json({ success: false, message: "You have already joined this event." });
      return;
    }
    console.error("joinEvent failed:", error);
    res.status(500).json({ success: false, message: "Could not join the event. Please try again." });
  }
}

export async function getJoinStatus(req: Request, res: Response): Promise<void> {
  const user = res.locals.user as AuthUser;
  const id = parseObjectId(req.params.id);

  if (!id) {
    res.status(400).json({ success: false, message: "Invalid event ID." });
    return;
  }

  try {
    const joined = await joinedEventsCollection();
    const record = await joined.findOne({ eventId: id, userEmail: user.email });
    res.json({ success: true, joined: Boolean(record) });
  } catch (error) {
    console.error("getJoinStatus failed:", error);
    res.status(500).json({ success: false, message: "Could not check your join status." });
  }
}

export async function getJoinedEvents(_req: Request, res: Response): Promise<void> {
  const user = res.locals.user as AuthUser;

  try {
    const joined = await joinedEventsCollection();
    const data = await joined
      .aggregate([
        { $match: { userEmail: user.email } },
        {
          $lookup: {
            from: "events",
            localField: "eventId",
            foreignField: "_id",
            as: "event",
          },
        },
        { $unwind: "$event" },
        { $sort: { "event.date": 1 } },
        {
          $replaceRoot: {
            newRoot: { $mergeObjects: ["$event", { joinedAt: "$joinedAt" }] },
          },
        },
      ])
      .toArray();

    res.json({ success: true, data });
  } catch (error) {
    console.error("getJoinedEvents failed:", error);
    res.status(500).json({ success: false, message: "Could not load your joined events." });
  }
}