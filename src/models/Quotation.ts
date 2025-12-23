import mongoose, { Document, Model, Schema, Types } from "mongoose";

// Import types from shared types file (can be used in client components)
export { PRESET_COST_ITEMS } from "@/types/quotation";
export type {
  ContainerType,
  Currency,
  Incoterms,
  IPort,
  IQuoteLineItem,
  Section,
  TransportMode
} from "@/types/quotation";

import type {
  ContainerType,
  Incoterms,
  IPort,
  IQuoteLineItem,
  TransportMode
} from "@/types/quotation";

export interface IQuotation extends Document {
  _id: mongoose.Types.ObjectId;
  shortId: string;
  owner: Types.ObjectId;
  pol: IPort;
  pod: IPort;
  containerType: ContainerType;
  incoterms: Incoterms;
  transportMode: TransportMode;
  lineItems: IQuoteLineItem[];
  price: number; // Legacy: total price for backward compatibility
  remarks?: string;
  validUntil: Date;
  // AIR freight fields
  grossWeight?: number;
  cbm?: number;
  chargeableWeight?: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

// Port sub-schema
const PortSchema = new Schema<IPort>(
  {
    name: { type: String, required: true, uppercase: true, trim: true },
    code: { type: String, default: null, uppercase: true, trim: true },
    country: { type: String, default: "", uppercase: true, trim: true },
  },
  { _id: false }
);

// Line Item sub-schema (with section for cost categorization)
const LineItemSchema = new Schema<IQuoteLineItem>(
  {
    section: { type: String, enum: ["ORIGIN", "FREIGHT", "DESTINATION"], default: "FREIGHT" },
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ["USD", "KRW", "EUR"], default: "USD" },
  },
  { _id: false }
);

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
    // Port of Loading (Object structure for analytics)
    pol: {
      type: PortSchema,
      required: [true, "Port of Loading is required"],
    },
    // Port of Discharge (Object structure for analytics)
    pod: {
      type: PortSchema,
      required: [true, "Port of Discharge is required"],
    },
    // Container type
    containerType: {
      type: String,
      enum: ["20GP", "40GP", "40HQ"],
      default: "40HQ",
    },
    // Incoterms
    incoterms: {
      type: String,
      enum: ["EXW", "FCA", "FOB", "CFR", "CIF", "DAP", "DDP"],
      default: "FOB",
    },
    // Transport mode (Ocean + Air freight)
    transportMode: {
      type: String,
      enum: ["FCL", "LCL", "AIR"],
      default: "FCL",
    },
    // Dynamic cost line items
    lineItems: {
      type: [LineItemSchema],
      default: [],
    },
    // Total price (calculated from lineItems, kept for backward compatibility)
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be positive"],
    },
    // Optional remarks/notes
    remarks: {
      type: String,
      default: "",
      maxlength: [500, "Remarks cannot exceed 500 characters"],
      trim: true,
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
    // AIR freight fields
    grossWeight: {
      type: Number,
      default: null,
      min: 0,
    },
    cbm: {
      type: Number,
      default: null,
      min: 0,
    },
    chargeableWeight: {
      type: Number,
      default: null,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Delete cached model if schema changed (e.g., pol/pod changed from string to object)
// This handles the case where hot-reload in dev keeps the old schema cached
if (mongoose.models.Quotation) {
  const existingSchema = mongoose.models.Quotation.schema;
  // Check if pol is using the old string type instead of the new PortSchema
  const polPath = existingSchema.path("pol");
  if (polPath && polPath.instance === "String") {
    delete mongoose.models.Quotation;
  }
}

const Quotation: Model<IQuotation> =
  mongoose.models.Quotation ||
  mongoose.model<IQuotation>("Quotation", QuotationSchema);

export default Quotation;
