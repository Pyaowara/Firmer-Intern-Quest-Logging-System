import "dotenv/config";
import express, { type Request, type Response } from "express";
import connectDB from "./config/database.js";
import userRoutes from "./routes/user/index.js";
import logRoutes from "./routes/log/index.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

connectDB();

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Logging System API" });
});

app.use("/api/users", userRoutes);
app.use("/api/logs", logRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});