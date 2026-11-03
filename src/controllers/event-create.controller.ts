import type { Request, Response } from "express";
import { eventsCollection } from "../config/collections.js";
import type { AuthUser } from "../middleware/verify-jwt.js";
import { parseEventInput } from "../utils/validation.js";

export async function createEvent(req: Request, res: Response): Promise<void> {
  const user = res.locals.user as AuthUser;
  const parsed = parseEventInput(req.body);

  if (!parsed.ok) {
    res.status(400).json({ success: false, message: parsed.message });
    return;
  }

  try {
    const events = await eventsCollection();
    const now = new Date();
    const doc = {
      ...parsed.data,
      // Always taken from the verified token, never from the request body.
      creatorEmail: user.email,
      creatorName: user.name,
      createdAt: now,
      updatedAt: now,
    };

    const result = await events.insertOne(doc);

    res.status(201).json({
      success: true,
      message: "Your event is live. Your neighborhood can feel it now.",
      data: { _id: result.insertedId, ...doc },
    });
  } catch (error) {
    console.error("createEvent failed:", error);
    res.status(500).json({ success: false, message: "Could not create the event. Please try again." });
  }
}