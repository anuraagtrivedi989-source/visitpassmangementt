import "dotenv/config";
import express from "express";
import ensureEnv from "./utils/ensureEnv.js";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import cookieParser from 'cookie-parser';
import authRoutes from "./routes/auth.js";
import visitorRoutes from "./routes/visitors.js";
import dashboardRoutes from "./routes/dashboard.js";
import appointmentRoutes from "./routes/appointments.js";
import reportRoutes from "./routes/reports.js";
import { requireAuth } from "./middleware/auth.js";

// Verify critical env vars for notifications (SMTP needed for email, Twilio optional)
ensureEnv([
  "SMTP_HOST",
  "SMTP_USER",
  "SMTP_PASSWORD",
]);

const app = express();
app.disable("x-powered-by");

app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", service: "visitpass-api" }),
);
app.use("/api/auth", authRoutes);
app.use("/api/visitors", requireAuth, visitorRoutes);
app.use("/api/dashboard", requireAuth, dashboardRoutes);
app.use("/api/appointments", requireAuth, appointmentRoutes);
app.use("/api/reports", requireAuth, reportRoutes);
app.use((req, res) => res.status(404).json({ message: "Route not found." }));
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err?.code === 11000)
    return res.status(409).json({ message: "Duplicate record. Please retry." });
  if (err?.name === "ValidationError")
    return res.status(400).json({ message: err.message });
  res.status(500).json({ message: "Internal server error." });
});

const port = Number(process.env.PORT || 5000);
if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  console.error(
    "Missing MONGODB_URI or JWT_SECRET. Copy .env.example to .env and configure it.",
  );
  process.exit(1);
}
try {
  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(port, () =>
    console.log(`VisitPass API running at http://localhost:${port}`),
  );
} catch (error) {
  console.error("MongoDB connection failed:", error.message);
  process.exit(1);
}
