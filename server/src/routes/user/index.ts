import express, { type Request, type Response, Router } from "express";
import { User } from "../../models/index.js";
import { authMiddleware, adminMiddleware } from "../../middleware/auth.js";

const router: Router = express.Router();

router.use(authMiddleware);

router.get("/", adminMiddleware, async (req: Request, res: Response) => {
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

export default router;
