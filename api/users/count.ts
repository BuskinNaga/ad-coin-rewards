import express from "express";
import { storage } from "../../server/storage.js";

const app = express();
app.use(express.json());

app.get("/api/users/count", async (_req, res) => {
  try {
    const allUsers = await storage.getAllUsers();
    return res.json({ count: allUsers.length });
  } catch (err) {
    console.error("USERS COUNT ERROR:", err);
    return res.status(500).json({ count: 0 });
  }
});

export default app;
