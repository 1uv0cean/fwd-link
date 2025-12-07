import mongoose, { Document, Model, Schema, Types } from "mongoose";

// Port structure for analytics
export interface IPort {
  name: string;
  code: string | null;
  country: string;
}

// Container types
export type ContainerType = "20GP" | "40GP" | "40HQ";

export interface IQuotation extends Document {
  _id: mongoose.Types.ObjectId;
  shortId: string;
  owner: Types.ObjectId;
  pol: IPort;
  pod: IPort;
  containerType: ContainerType;
  price: number;
  validUntil: Date;
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
    // Quote price (USD only)
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be positive"],
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
