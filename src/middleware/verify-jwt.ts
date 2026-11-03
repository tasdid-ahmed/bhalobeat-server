import type { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  image: string | null;
};

function getAuthUrl(): string {
  const url = process.env.AUTH_URL?.replace(/\/+$/, "");
  if (!url) {
    throw new Error("AUTH_URL is missing from environment variables.");
  }
  return url;
}

let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

function getJwks() {
  jwks ??= createRemoteJWKSet(new URL(`${getAuthUrl()}/api/auth/jwks`));
  return jwks;
}

export async function verifyJWT(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Please log in to continue." });
    return;
  }

  try {
    const { payload } = await jwtVerify(header.slice(7), getJwks(), {
      issuer: getAuthUrl(),
    });

    const email = typeof payload.email === "string" ? payload.email : "";
    if (!email) {
      res.status(401).json({ success: false, message: "Invalid login token." });
      return;
    }

    const user: AuthUser = {
      id: String(payload.id ?? payload.sub ?? ""),
      email,
      name: typeof payload.name === "string" ? payload.name : "BhaloBeat Member",
      image: typeof payload.image === "string" ? payload.image : null,
    };

    res.locals.user = user;
    next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    res.status(401).json({
      success: false,
      message: "Your session is invalid or has expired. Please log in again.",
    });
  }
}