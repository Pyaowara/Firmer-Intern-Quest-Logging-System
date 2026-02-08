import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/database.js";
import userRoutes from "./routes/user/index.js";
import logRoutes from "./routes/log/index.js";
import authRoutes from "./routes/auth/index.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

connectDB();

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Logging System API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/logs", logRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});