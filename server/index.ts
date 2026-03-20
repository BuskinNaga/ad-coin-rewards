import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Register all API routes first
await registerRoutes(httpServer, app);

const isProd = process.env.NODE_ENV === "production";

if (isProd) {
  // Production: serve the Vite-built SPA from dist/public
  const distPath = path.resolve(__dirname, "../dist/public");
  app.use(express.static(distPath));

  // Express 5 catch-all: serve index.html for any non-API route
  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  // Development: mount Vite as middleware so the React app and
  // the Express API are served on the same port with full HMR.
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
}

// ── Port startup with automatic fallback ─────────────────────────────
const BASE_PORT = Number(process.env.PORT) || 5000;

function startServer(port: number): void {
  httpServer.removeAllListeners("error");
  httpServer.once("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`[server] Port ${port} in use — trying ${port + 1}`);
      startServer(port + 1);
    } else {
      console.error("[server] Fatal error:", err);
      process.exit(1);
    }
  });
  httpServer.listen(port, "0.0.0.0", () => {
    console.log(`[server] Running on http://localhost:${port}`);
  });
}

startServer(BASE_PORT);

export { app, httpServer };
