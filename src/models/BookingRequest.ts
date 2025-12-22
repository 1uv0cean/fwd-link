import mongoose, { Document, Model, Schema, Types } from "mongoose";

// Booking request status
export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface IBookingRequest extends Document {
  _id: mongoose.Types.ObjectId;
  quotation: Types.ObjectId;
  owner: Types.ObjectId; // Forwarder who owns the quote
  // Shipper info
  shipperCompany: string;
  shipperName: string;
  shipperEmail: string;
  shipperPhone: string;
  // Cargo info
  readyDate: Date;
  commodity: string;
  volume: string;
  message?: string;
  // Status
  status: BookingStatus;
  // Quick reference fields (denormalized for easy display)
  route: string; // "BUSAN → SHANGHAI"
  quoteShortId: string;
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const BookingRequestSchema = new Schema<IBookingRequest>(
  {
    quotation: {
      type: Schema.Types.ObjectId,
      ref: "Quotation",
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Shipper info
    shipperCompany: {
      type: String,
      required: true,
      trim: true,
    },
    shipperName: {
      type: String,
      required: true,
      trim: true,
    },
    shipperEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    shipperPhone: {
      type: String,
      required: true,
      trim: true,
    },
    // Cargo info
    readyDate: {
      type: Date,
      required: true,
    },
    commodity: {
      type: String,
      required: true,
      trim: true,
    },
    volume: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
    },
    // Status
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    // Quick reference
    route: {
      type: String,
      required: true,
    },
    quoteShortId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
BookingRequestSchema.index({ owner: 1, createdAt: -1 });
BookingRequestSchema.index({ quotation: 1 });

// Prevent model recompilation
const BookingRequest: Model<IBookingRequest> =
  mongoose.models.BookingRequest ||
  mongoose.model<IBookingRequest>("BookingRequest", BookingRequestSchema);

export default BookingRequest;
