import express, { type Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes"; // your fixed routes
import { storage } from "./storage";

const app: Express = express();
const httpServer: Server = createServer(app);

// === Middleware ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// === API Routes ===
await registerRoutes(httpServer, app);

// === Serve SPA in production ===
if (process.env.NODE_ENV === "production") {
  const distPath = path.resolve(import.meta.dirname, "dist/public");
  app.use(express.static(distPath));

  // For SPA routing: send index.html for all unmatched routes
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// === Start Server (optional for local dev) ===
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export { app, httpServer };