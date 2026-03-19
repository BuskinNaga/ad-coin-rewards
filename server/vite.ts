import express, { type Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { fileURLToPath } from "url"; // Added for ESM safety
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { storage } from "./storage";

const app: Express = express();
const httpServer: Server = createServer(app);

// === Middleware ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// === Setup ESM Dirname (Safe for all Node versions) ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === API Routes ===
// Using top-level await is fine because of our ESNext tsconfig
await registerRoutes(httpServer, app);

// === Serve SPA in production ===
if (process.env.NODE_ENV === "production") {
  // We look for dist/public relative to this file
  const distPath = path.resolve(__dirname, "../dist/public");
  app.use(express.static(distPath));

  // FIX: Using "*" instead of "(.*)" to avoid PathError
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// === Start Server ===
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`[server] Shop backend running on port ${PORT}`);
});

export { app, httpServer };
