import express, { type Request, type Response, Router } from "express";
import mongoose from "mongoose";
import { Log } from "../../models/index.js";
import { formatTimestamp, getTodayDateRange } from "../../utils/index.js";
import { z } from "zod/v4";

const logQuerySchema = z.object({
    action: z.string().optional(),
    startDate: z.coerce.date("Invalid date format").optional(),
    endDate: z.coerce.date("Invalid date format").optional(),
    userId: z.union([z.literal("all"), z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid ObjectId format")]).optional(),
    statusCode: z.string().optional(),
    labnumber: z.string().optional(),
    minTimeMs: z.coerce.number().int().min(0, "minTimeMs cannot be negative").default(0),
    maxTimeMs: z.coerce.number().int().min(0, "maxTimeMs cannot be negative").default(999999),
    page: z.coerce.number().int().min(1, "page must be at least 1").default(1),
    limit: z.coerce.number().int().min(1).max(500, "limit cannot exceed 500").default(50),
}).refine(
    (data) => data.minTimeMs <= data.maxTimeMs,
    { message: "minTimeMs cannot be greater than maxTimeMs" }
);

const router: Router = express.Router();

router.get("/", async (req: Request, res: Response) => {
    const result = logQuerySchema.safeParse(req.query);

    if (!result.success) {
        res.status(400).json({
            success: false,
            message: result.error.issues[0]?.message ?? "Validation error",
        });
        return;
    }

    const { action, startDate, endDate, userId, statusCode, labnumber, minTimeMs, maxTimeMs, page, limit } = result.data;
    const { startDate: defaultStart, endDate: defaultEnd } = getTodayDateRange();
    const skip = (page - 1) * limit;

    try {
        const filter: Record<string, any> = {};

        // Timestamp filter
        filter.timestamp = {
            $gte: startDate ?? defaultStart,
            $lte: endDate ?? defaultEnd,
        };

        // Action filter
        if (action && action !== "all") {
            filter.action = action;
        }

        // User ID filter
        if (userId && userId !== "all") {
            filter.userId = new mongoose.Types.ObjectId(userId);
        }

        // Status code filter
        if (statusCode) {
            filter["response.statusCode"] = statusCode;
        }

        // Labnumber filter
        if (labnumber) {
            filter.labnumber = { $in: [labnumber] };
        }

        // Response time filter
        filter["response.timeMs"] = {
            $gte: minTimeMs,
            $lte: maxTimeMs,
        };

        const totalCount = await Log.countDocuments(filter);

        const logs = await Log.find(filter)
            .populate({
                path: "userId",
                select: "-password",
                match: { isDel: false },
            })
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit);

        const filteredLogs = logs.filter((log) => log.userId !== null);

        const formattedLogs = filteredLogs.map((log) => ({
            ...log.toObject(),
            timestamp: formatTimestamp(new Date(log.timestamp)),
        }));

        res.json({
            success: true,
            count: formattedLogs.length,
            totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit),
            data: formattedLogs,
        });
    } catch (error) {
        console.error("Error fetching logs:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

export default router;
