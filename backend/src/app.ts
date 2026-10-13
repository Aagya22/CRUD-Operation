import express from "express";
import cors from "cors";
import itemRoutes from "./routes/itemRoutes";

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());
app.use(itemRoutes);

export default app;