import "dotenv/config";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import helmet from "helmet";
import { verifyJWT } from "./middleware/verify-jwt.js";
import eventRoutes from "./routes/event.routes.js";

if (process.env.NODE_ENV === "production" && (!process.env.CLIENT_URL || !process.env.AUTH_URL)) {
  throw new Error("CLIENT_URL and AUTH_URL must be set in production.");
}

const app = express();

app.use(helmet());

// CLIENT_URL can hold several origins, separated by commas.
const allowedOrigins = (process.env.CLIENT_URL ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "20kb" }));

app.get("/", (_req: Request, res: Response) => {
  res.json({ success: true, message: "Welcome to BhaloBeat API!" });
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "BhaloBeat API is running!",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/me", verifyJWT, (_req: Request, res: Response) => {
  res.json({ success: true, user: res.locals.user });
});

app.use("/api", eventRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

app.use(
  (error: Error & { type?: string }, _req: Request, res: Response, _next: NextFunction) => {
    if (error.type === "entity.parse.failed") {
      res.status(400).json({ success: false, message: "The request body is not valid JSON." });
      return;
    }
    if (error.type === "entity.too.large") {
      res.status(413).json({ success: false, message: "The request body is too large." });
      return;
    }
    console.error("Unhandled error:", error);
    res.status(500).json({ success: false, message: "Something went wrong on our side." });
  }
);

export default app;