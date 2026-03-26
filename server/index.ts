import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import cookieParser from "cookie-parser";
import cors from "cors"; // ✅ ADD THIS
import { registerRoutes } from "./routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// ✅ CORS FIX (VERY IMPORTANT)
app.use(cors({
  origin: "https://0c0255b0-0179-4582-8346-503e3306424b-00-z6vy6x934mov.kirk.replit.dev/watch", // 🔥 REPLACE THIS
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Register all API routes first
await registerRoutes(httpServer, app);

const isProd = process.env.NODE_ENV === "production";

let vite: any; // ✅ FIX (so vite is accessible below)

if (isProd) {
  const distPath = path.resolve(__dirname, "../dist/public");
  app.use(express.static(distPath));

  app.get(/^(?!\/api).+/, (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  const { createServer: createViteServer } = await import("vite");
  vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: { server: httpServer }
    },
    appType: "spa",
  });

  app.use(vite.middlewares);
}

// ✅ FIXED: only use this in dev (vite exists)
if (!isProd) {
  app.use(async (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    const url = req.originalUrl;
    try {
      const templatePath = path.resolve(__dirname, "..", "client", "index.html");
      let template = fs.readFileSync(templatePath, "utf-8");
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

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
    console.log(`[server] Running on http://0.0.0.0:${port}`);
  });
}

startServer(BASE_PORT);

export { app, httpServer };