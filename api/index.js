import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "../server/src/config/database.js";
import userRoutes from "../server/src/routes/user/index.js";
import logRoutes from "../server/src/routes/log/index.js";
import authRoutes from "../server/src/routes/auth/index.js";

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL || true,
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/logs", logRoutes);

app.get("/api", (req, res) => {
    res.json({ message: "Logging System API" });
});

export default app;
