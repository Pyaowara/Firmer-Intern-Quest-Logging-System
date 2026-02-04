import express, { type Request, type Response, Router } from "express";
import mongoose from "mongoose";
import { Log } from "../../models/index.js";
import { formatTimestamp, getTodayDateRange, logQuerySchema, ACTION_ORDER } from "../../utils/index.js";

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

    const totalCount = await Log.countDocuments(filter);

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

      logs = await Log.aggregate([
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
        { $skip: skip },
        { $limit: limit },
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
      ]);
    } else {
      logs = await Log.find(filter)
        .populate({
          path: "userId",
          select: "-password",
          match: { isDel: false },
        })
        .sort(sortObj)
        .skip(skip)
        .limit(limit);
    }

    const formattedLogs = logs.map((log: any) => ({
      ...(log.toObject ? log.toObject() : log),
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
