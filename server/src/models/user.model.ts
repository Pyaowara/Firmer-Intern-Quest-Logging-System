import mongoose, { Schema, Document, Model } from "mongoose";

export type UserLevel = "admin" | "user";

export interface IUser extends Document {
  username: string;
  password: string;
  code: string;
  prefix: string;
  firstname: string;
  lastname: string;
  isActive: boolean;
  isDel: boolean;
  level: UserLevel;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    prefix: {
      type: String,
      required: true,
    },
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDel: {
      type: Boolean,
      default: false,
    },
    level: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for query optimization
userSchema.index({ isDel: 1 });
userSchema.index({ code: 1 });
userSchema.index({ isActive: 1 });

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema, "user");

export default User;
