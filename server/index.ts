import express, { type Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";

const app: Express = express();
const httpServer: Server = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ESM directory safety
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize your API and Database routes
await registerRoutes(httpServer, app);

if (process.env.NODE_ENV === "production") {
  const distPath = path.resolve(__dirname, "../dist/public");
  app.use(express.static(distPath));

  // The fix is right here: using /:path* instead of just *
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`[server] Backend live on port ${PORT}`);
});

export { app, httpServer };
