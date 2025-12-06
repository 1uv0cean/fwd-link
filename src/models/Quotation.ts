import { CURRENCIES, type Currency } from "@/lib/constants";
import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IQuotation extends Document {
  _id: mongoose.Types.ObjectId;
  shortId: string;
  owner: Types.ObjectId;
  pol: string; // Port of Loading
  pod: string; // Port of Discharge
  price: number;
  currency: Currency;
  validUntil: Date;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuotationSchema = new Schema<IQuotation>(
  {
    // Unique short ID for sharing (nanoid 7 chars)
    shortId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // Reference to the owner user
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Port of Loading (e.g., "BUSAN")
    pol: {
      type: String,
      required: [true, "Port of Loading is required"],
      uppercase: true,
      trim: true,
    },
    // Port of Discharge (e.g., "LA")
    pod: {
      type: String,
      required: [true, "Port of Discharge is required"],
      uppercase: true,
      trim: true,
    },
    // Quote price
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be positive"],
    },
    // Currency stored per quote
    currency: {
      type: String,
      enum: Object.values(CURRENCIES),
      required: true,
    },
    // Quote validity date
    validUntil: {
      type: Date,
      required: [true, "Valid until date is required"],
    },
    // View counter for analytics (Read Receipt feature)
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in development
const Quotation: Model<IQuotation> =
  mongoose.models.Quotation ||
  mongoose.model<IQuotation>("Quotation", QuotationSchema);

export default Quotation;
