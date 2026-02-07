import express, { type Response, Router } from "express";
import mongoose from "mongoose";
import { Log } from "../../models/index.js";
import {
  formatTimestamp,
  getTodayDateRange,
  logQuerySchema,
  ACTION_ORDER,
} from "../../utils/index.js";
import { authMiddleware, type AuthRequest } from "../../middleware/auth.js";

const router: Router = express.Router();
router.use(authMiddleware);

async function fetchLogsHandler(
  req: AuthRequest,
  res: Response,
  isExport: boolean = false,
) {
  const result = logQuerySchema.safeParse(req.query);

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: result.error.issues[0]?.message ?? "Validation error",
    });
    return;
  }

  const {
    action,
    startDate,
    endDate,
    userId,
    statusCode,
    labnumber,
    minTimeMs,
    maxTimeMs,
    page,
    limit,
    sortBy,
    sortOrder,
  } = result.data;
  const { startDate: defaultStart, endDate: defaultEnd } = getTodayDateRange();
  const skip = (page - 1) * limit;

  try {
    const filter: Record<string, any> = {};

    // Timestamp filter
    filter.timestamp = {
      $gte: startDate ?? defaultStart,
      $lte: endDate ?? defaultEnd,
    };

    // Action filter (array support)
    if (action) {
      const actions = Array.isArray(action) ? action : [action];
      const filtered = actions.filter((a) => a && a !== "all");
      if (filtered.length > 0) {
        filter.action = { $in: filtered };
      }
    }

    // User ID filter (array of ObjectIds)
    if (userId) {
      const userIds = Array.isArray(userId) ? userId : [userId];
      const filtered = userIds.filter((id) => id && id !== "all");
      const validUserIds = filtered.map(
        (id) => new mongoose.Types.ObjectId(id),
      );
      if (validUserIds.length > 0) {
        filter.userId = { $in: validUserIds };
      }
    }

    // If user level is "user", only show their own logs
    if (req.user?.level === "user") {
      filter.userId = new mongoose.Types.ObjectId(req.user.id);
    }

    // Status code filter
    if (statusCode) {
      filter["response.statusCode"] = { $regex: statusCode, $options: "i" };
    }

    // Labnumber filter
    if (labnumber) {
      filter.labnumber = { $elemMatch: { $regex: labnumber, $options: "i" } };
    }

    // Response time filter
    filter["response.timeMs"] = {
      $gte: minTimeMs,
      $lte: maxTimeMs,
    };

    const totalCount = isExport ? 0 : await Log.countDocuments(filter);

    // Sort
    let sortObj: Record<string, 1 | -1> = { timestamp: -1 };
    const useActionSort = sortBy === "action" && sortOrder !== "none";

    if (sortOrder !== "none" && sortBy) {
      const sortDirection = sortOrder === "asc" ? 1 : -1;
      if (sortBy === "timestamp") {
        sortObj = { timestamp: sortDirection };
      } else if (sortBy === "timeMs") {
        sortObj = { "response.timeMs": sortDirection };
      }
    }

    let logs;

    if (useActionSort) {
      const sortDirection = sortOrder === "asc" ? 1 : -1;
      const actionBranches = ACTION_ORDER.map((act, idx) => ({
        case: { $eq: ["$action", act] },
        then: idx,
      }));

      const pipeline: any[] = [
        { $match: filter },
        {
          $addFields: {
            actionOrder: {
              $switch: {
                branches: actionBranches,
                default: ACTION_ORDER.length,
              },
            },
          },
        },
        { $sort: { actionOrder: sortDirection } },
      ];

      if (!isExport) {
        pipeline.push({ $skip: skip }, { $limit: limit });
      }

      pipeline.push(
        {
          $lookup: {
            from: "user",
            localField: "userId",
            foreignField: "_id",
            as: "userId",
          },
        },
        { $unwind: "$userId" },
        { $match: { "userId.isDel": false } },
        { $project: { actionOrder: 0, "userId.password": 0 } },
      );

      logs = await Log.aggregate(pipeline);
    } else {
      const query = Log.find(filter)
        .populate({
          path: "userId",
          select: "-password",
          match: { isDel: false },
        })
        .sort(sortObj);

      if (!isExport) {
        query.skip(skip).limit(limit);
      }

      logs = await query;
    }

    const formattedLogs = logs.map((log: any) => ({
      ...(log.toObject ? log.toObject() : log),
      timestamp: formatTimestamp(new Date(log.timestamp)),
    }));

    if (isExport) {
      res.json({
        success: true,
        count: formattedLogs.length,
        data: formattedLogs,
      });
    } else {
      res.json({
        success: true,
        count: formattedLogs.length,
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        data: formattedLogs,
      });
    }
  } catch (error) {
    console.error(`Error ${isExport ? "exporting" : "fetching"} logs:`, error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

router.get("/", (req: AuthRequest, res: Response) =>
  fetchLogsHandler(req, res, false),
);

router.get("/export", (req: AuthRequest, res: Response) =>
  fetchLogsHandler(req, res, true),
);

export default router;
