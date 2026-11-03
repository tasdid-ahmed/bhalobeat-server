import { Router } from "express";
import { createEvent } from "../controllers/event-create.controller.js";
import {
  deleteEvent,
  getMyEvents,
  updateEvent,
} from "../controllers/event-manage.controller.js";
import { getEventById, getUpcomingEvents } from "../controllers/events.controller.js";
import { verifyJWT } from "../middleware/verify-jwt.js";

const router = Router();

router.get("/events/upcoming", getUpcomingEvents);
router.get("/events/:id", getEventById);
router.post("/events", verifyJWT, createEvent);
router.get("/my-events", verifyJWT, getMyEvents);
router.patch("/events/:id", verifyJWT, updateEvent);
router.delete("/events/:id", verifyJWT, deleteEvent);

export default router;