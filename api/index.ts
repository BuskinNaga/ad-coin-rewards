import express from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "../server/routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Build routes once; the promise is reused on warm invocations
const ready = registerRoutes(null as any, app);

export default async function handler(req: any, res: any) {
  await ready;
  return app(req, res);
}
