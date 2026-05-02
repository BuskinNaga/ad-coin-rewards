import express from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "../server/routes.js";
import { applyRlsPolicies } from "../server/db.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Apply RLS policies once per cold start, then register routes.
// Both promises are module-level so warm Vercel invocations reuse them.
const ready = applyRlsPolicies().then(() => registerRoutes(null as any, app));

export default async function handler(req: any, res: any) {
  await ready;
  return app(req, res);
}
