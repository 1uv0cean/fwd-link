import { SUBSCRIPTION_STATUS, type SubscriptionStatus } from "@/lib/constants";
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
  image?: string;
  usageCount: number;
  subscriptionStatus: SubscriptionStatus;
  subscriptionEndDate?: Date;
  lemonCustomerId?: string;
  provider: "google" | "email";
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    image: {
      type: String,
    },
    // CRITICAL: Paywall counter
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Subscription status for paywall logic
    subscriptionStatus: {
      type: String,
      enum: Object.values(SUBSCRIPTION_STATUS),
      default: SUBSCRIPTION_STATUS.FREE,
    },
    // Subscription end date
    subscriptionEndDate: {
      type: Date,
    },
    // Lemon Squeezy customer ID for billing sync
    lemonCustomerId: {
      type: String,
      sparse: true,
    },
    // Auth provider
    provider: {
      type: String,
      enum: ["google", "email"],
      required: true,
    },
    // For email magic link verification
    emailVerified: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in development
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
