import { SUBSCRIPTION_STATUS, type SubscriptionStatus } from "@/lib/constants";
import mongoose, { Document, Model, Schema } from "mongoose";

// Branding settings for Pro users
export interface IBranding {
  companyName?: string;
  logoBase64?: string;
  primaryColor?: string;
  contactEmail?: string;
  contactPhone?: string;
}

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
  branding?: IBranding;
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
    // Branding settings (Pro only)
    branding: {
      companyName: {
        type: String,
        maxlength: [100, "Company name cannot exceed 100 characters"],
        trim: true,
      },
      logoBase64: {
        type: String,
        maxlength: [700000, "Logo size too large"], // ~500KB in Base64
      },
      primaryColor: {
        type: String,
        match: [/^#[0-9A-Fa-f]{6}$/, "Invalid hex color format"],
      },
      contactEmail: {
        type: String,
        maxlength: [100, "Contact email too long"],
        trim: true,
      },
      contactPhone: {
        type: String,
        maxlength: [30, "Contact phone too long"],
        trim: true,
      },
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
