import "dotenv/config";
import express, { type Request, type Response } from "express";
import connectDB from "./config/database.js";
import { Log, User } from "./models/index.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

connectDB();

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Logging System API" });
});

app.get("/api/users", async (req: Request, res: Response) => {
  try {
    const users = await User.find({ isDel: false }).select("-password");
    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.get("/api/logs", async (req: Request, res: Response) => {
  try {
    const logs = await Log.find().populate("userId", "-password").limit(10);
    res.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching logs",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
