import express from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "../server/routes.js";
import { applyRlsPolicies } from "../server/db.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

let initialized = false;
let initError: Error | null = null;

async function init() {
  try {
    await applyRlsPolicies();
    await registerRoutes(null as any, app);
    initialized = true;
  } catch (err) {
    initError = err as Error;
    console.error("[api/index] Initialization failed:", err);
  }
}

const ready = init();

export default async function handler(req: any, res: any) {
  await ready;
  if (!initialized) {
    console.error("[api/index] Not initialized, retrying...", initError);
    try {
      await applyRlsPolicies();
      await registerRoutes(null as any, app);
      initialized = true;
    } catch (err) {
      return res.status(503).json({ message: "Service temporarily unavailable. Please try again." });
    }
  }
  return app(req, res);
}
