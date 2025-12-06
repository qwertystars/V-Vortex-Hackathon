// server.js
import { clerkMiddleware, requireAuth } from "@clerk/express";
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { pool } from "./db.js";

const app = express();

// Allow frontend origin
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Clerk middleware (uses keys from .env)
app.use(
  clerkMiddleware({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  })
);

// Parse JSON bodies
app.use(express.json());

// Public route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Protected route
app.get("/api/protected", requireAuth(), (req, res) => {
  res.json({
    message: "You are authenticated!",
    userId: req.auth.userId,
  });
});

// Use env PORT if available, otherwise default to 5000 (so it doesn't conflict with React's 3000)
const PORT = process.env.PORT || 5000;
console.log("DB URL:", process.env.DATABASE_URL);

// Test DB Connection
pool.connect().then(() => {
  console.log("✅ Connected to Neon Database");
}).catch((err) => {
  console.error("❌ Database connection error:", err);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
