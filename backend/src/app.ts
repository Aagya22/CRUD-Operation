
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import itemRoutes from "./routes/itemRoutes";
import authRoutes from "./routes/authRoutes";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoutes);
app.use(itemRoutes);

app.use(itemRoutes);

export default app;
