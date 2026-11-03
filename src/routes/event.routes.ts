import { Router } from "express";
import { getEventById, getUpcomingEvents } from "../controllers/events.controller.js";

const router = Router();

router.get("/events/upcoming", getUpcomingEvents);
router.get("/events/:id", getEventById);

export default router;