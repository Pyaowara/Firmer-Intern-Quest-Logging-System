import mongoose, { Schema, Document, Model, Types } from "mongoose";

interface IRequest {
  method: string;
  endpoint: string;
}

interface IResponse {
  statusCode: string;
  message: string;
  timeMs: number;
}

export interface ILog extends Document {
  timestamp: Date;
  request: IRequest;
  response: IResponse;
  action: string;
  userId: Types.ObjectId;
  labnumber: string[];
}

const logSchema = new Schema<ILog>(
  {
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    request: {
      method: {
        type: String,
        required: true,
        enum: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
      },
      endpoint: {
        type: String,
        required: true,
      },
    },
    response: {
      statusCode: {
        type: String,
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
      timeMs: {
        type: Number,
        required: true,
      },
    },
    action: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    labnumber: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for query optimization
logSchema.index({ timestamp: -1 });
logSchema.index({ userId: 1 });
logSchema.index({ action: 1 });
logSchema.index({ "response.statusCode": 1 });
logSchema.index({ "response.timeMs": 1 });
logSchema.index({ labnumber: 1 });
logSchema.index({ timestamp: -1, userId: 1 });

const Log: Model<ILog> = mongoose.model<ILog>("Log", logSchema, "log");

export default Log;
