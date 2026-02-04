import { z } from "zod/v4";

export const formatTimestamp = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

export const getTodayDateRange = () => {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    return { startDate, endDate };
};

export const ACTION_ORDER = [
  "labOrder",
  "labResult",
  "receive",
  "accept",
  "approve",
  "reapprove",
  "unapprove",
  "unreceive",
  "rerun",
  "save",
  "listTransactions",
  "getTransaction",
  "analyzerResult",
  "analyzerRequest",
];

const stringOrArray = z.union([z.string(), z.array(z.string())]);
const objectIdString = z.union([
  z.literal("all"),
  z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid ObjectId format"),
]);
const objectIdOrArray = z.union([objectIdString, z.array(objectIdString)]);

export const logQuerySchema = z
  .object({
    action: stringOrArray.optional(),
    startDate: z.coerce.date("Invalid date format").optional(),
    endDate: z.coerce.date("Invalid date format").optional(),
    userId: objectIdOrArray.optional(),
    statusCode: z.string().optional(),
    labnumber: z.string().optional(),
    minTimeMs: z.coerce
      .number()
      .int()
      .min(0, "minTimeMs cannot be negative")
      .default(0),
    maxTimeMs: z.coerce
      .number()
      .int()
      .min(0, "maxTimeMs cannot be negative")
      .default(999999),
    page: z.coerce.number().int().min(1, "page must be at least 1").default(1),
    limit: z.coerce.number().int().min(1).default(50),
    sortBy: z.enum(["timestamp", "timeMs", "action"]).optional(),
    sortOrder: z.enum(["none", "asc", "desc"]).default("none"),
  })
  .refine((data) => data.minTimeMs <= data.maxTimeMs, {
    message: "minTimeMs cannot be greater than maxTimeMs",
  });