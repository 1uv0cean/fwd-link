"use server";

import { auth } from "@/lib/auth";
import { ERROR_CODES, FREE_QUOTA_LIMIT, SUBSCRIPTION_STATUS } from "@/lib/constants";
import dbConnect from "@/lib/db";
import Quotation, {
  type ContainerType,
  type Incoterms,
  type IPort,
  type IQuoteLineItem,
  type TransportMode
} from "@/models/Quotation";
import User from "@/models/User";
import { nanoid } from "nanoid";

interface CreateQuotationInput {
  pol: IPort;
  pod: IPort;
  containerType: ContainerType;
  incoterms: Incoterms;
  transportMode: TransportMode;
  lineItems: IQuoteLineItem[];
  price: number;
  remarks?: string;
  validUntil: Date;
  // AIR freight fields
  grossWeight?: number;
  cbm?: number;
  chargeableWeight?: number;
}

interface QuotationResult {
  success: boolean;
  shortId?: string;
  error?: string;
  errorCode?: string;
}

export async function createQuotation(
  input: CreateQuotationInput
): Promise<QuotationResult> {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return {
        success: false,
        error: "Unauthorized",
        errorCode: ERROR_CODES.UNAUTHORIZED,
      };
    }

    await dbConnect();

    // Find the user
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return {
        success: false,
        error: "User not found",
        errorCode: ERROR_CODES.UNAUTHORIZED,
      };
    }

    // ============================================
    // THE GATEKEEPER LOGIC - HARD PAYWALL CHECK
    // ============================================
    if (
      user.usageCount >= FREE_QUOTA_LIMIT &&
      user.subscriptionStatus !== SUBSCRIPTION_STATUS.ACTIVE
    ) {
      return {
        success: false,
        error: "Free quota limit reached. Please upgrade to Pro.",
        errorCode: ERROR_CODES.LIMIT_REACHED,
      };
    }

    // Generate a unique short ID (7 chars)
    const shortId = nanoid(7);

    // Create the quotation with line items
    const quotation = await Quotation.create({
      shortId,
      owner: user._id,
      pol: {
        name: input.pol.name.toUpperCase().trim(),
        code: input.pol.code?.toUpperCase().trim() || null,
        country: input.pol.country?.toUpperCase().trim() || "",
      },
      pod: {
        name: input.pod.name.toUpperCase().trim(),
        code: input.pod.code?.toUpperCase().trim() || null,
        country: input.pod.country?.toUpperCase().trim() || "",
      },
      containerType: input.containerType || "40HQ",
      incoterms: input.incoterms || "FOB",
      transportMode: input.transportMode || "FCL",
      lineItems: input.lineItems || [],
      price: input.price,
      remarks: input.remarks?.trim() || "",
      validUntil: new Date(input.validUntil),
      views: 0,
      // AIR freight fields
      grossWeight: input.grossWeight || null,
      cbm: input.cbm || null,
      chargeableWeight: input.chargeableWeight || null,
    } as any);

    // ============================================
    // ATOMIC INCREMENT - Prevent race conditions
    // ============================================
    await User.findByIdAndUpdate(user._id, {
      $inc: { usageCount: 1 },
    });

    return {
      success: true,
      shortId: (quotation as any).shortId,
    };
  } catch (error) {
    console.error("Error creating quotation:", error);
    return {
      success: false,
      error: "Failed to create quotation",
    };
  }
}

export async function getQuotation(
  shortId: string,
  options: { incrementView?: boolean } = { incrementView: true }
) {
  try {
    await dbConnect();

    const quotation = await Quotation.findOne({ shortId }).lean();

    if (!quotation) {
      return { success: false, error: "Quotation not found" };
    }

    // Increment view count if requested
    if (options.incrementView) {
      await Quotation.findByIdAndUpdate(quotation._id, {
        $inc: { views: 1 },
      });
    }

    // Fetch owner's branding info (for Pro users)
    const owner = await User.findById(quotation.owner).lean();
    const ownerBranding = owner?.subscriptionStatus === SUBSCRIPTION_STATUS.ACTIVE
      ? owner.branding
      : undefined;

    return {
      success: true,
      quotation: {
        shortId: quotation.shortId,
        pol: quotation.pol,
        pod: quotation.pod,
        containerType: quotation.containerType || "40HQ",
        incoterms: quotation.incoterms || "FOB",
        transportMode: quotation.transportMode || "FCL",
        lineItems: quotation.lineItems || [],
        price: quotation.price,
        remarks: quotation.remarks || "",
        validUntil: quotation.validUntil.toISOString(),
        views: quotation.views + (options.incrementView ? 1 : 0),
        // AIR freight fields
        grossWeight: quotation.grossWeight || null,
        cbm: quotation.cbm || null,
        chargeableWeight: quotation.chargeableWeight || null,
      },
      // Include owner branding for display on quote page
      ownerBranding: ownerBranding ? {
        companyName: ownerBranding.companyName,
        logoBase64: ownerBranding.logoBase64,
        primaryColor: ownerBranding.primaryColor,
        contactEmail: ownerBranding.contactEmail,
        contactPhone: ownerBranding.contactPhone,
      } : undefined,
    };
  } catch (error) {
    console.error("Error fetching quotation:", error);
    return { success: false, error: "Failed to fetch quotation" };
  }
}

export async function getUserQuotations(params?: {
  search?: string;
  type?: string;
}) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized" };
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Build query
    const query: any = { owner: user._id };

    if (params?.type && params.type !== "ALL") {
      query.containerType = params.type;
    }

    if (params?.search) {
      const searchRegex = new RegExp(params.search, "i");
      query.$or = [
        { "pol.name": searchRegex },
        { "pod.name": searchRegex },
        { shortId: searchRegex },
      ];
    }

    const quotations = await Quotation.find(query)
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return {
      success: true,
      quotations: quotations.map((q) => ({
        shortId: q.shortId,
        pol: q.pol,
        pod: q.pod,
        containerType: q.containerType || "40HQ",
        incoterms: q.incoterms || "FOB",
        transportMode: q.transportMode || "FCL",
        price: q.price,
        remarks: q.remarks || "",
        validUntil: q.validUntil.toISOString(),
        views: q.views,
        createdAt: q.createdAt.toISOString(),
      })),
      usageCount: user.usageCount,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionEndDate: user.subscriptionEndDate?.toISOString(),
    };
  } catch (error) {
    console.error("Error fetching user quotations:", error);
    return { success: false, error: "Failed to fetch quotations" };
  }
}

// ============================================
// UPDATE QUOTATION
// ============================================
interface UpdateQuotationInput {
  shortId: string;
  pol?: IPort;
  pod?: IPort;
  containerType?: ContainerType;
  incoterms?: Incoterms;
  transportMode?: TransportMode;
  lineItems?: IQuoteLineItem[];
  price?: number;
  remarks?: string;
  validUntil?: Date;
  // AIR freight fields
  grossWeight?: number;
  cbm?: number;
  chargeableWeight?: number;
}

export async function updateQuotation(
  input: UpdateQuotationInput
): Promise<QuotationResult> {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return {
        success: false,
        error: "Unauthorized",
        errorCode: ERROR_CODES.UNAUTHORIZED,
      };
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return {
        success: false,
        error: "User not found",
        errorCode: ERROR_CODES.UNAUTHORIZED,
      };
    }

    // Find quotation and verify ownership
    const quotation = await Quotation.findOne({ shortId: input.shortId });

    if (!quotation) {
      return {
        success: false,
        error: "Quotation not found",
      };
    }

    if (quotation.owner.toString() !== user._id.toString()) {
      return {
        success: false,
        error: "You don't have permission to edit this quotation",
        errorCode: ERROR_CODES.UNAUTHORIZED,
      };
    }

    // Update fields if provided
    if (input.pol) {
      quotation.pol = {
        name: input.pol.name.toUpperCase().trim(),
        code: input.pol.code?.toUpperCase().trim() || null,
        country: input.pol.country?.toUpperCase().trim() || "",
      };
    }
    if (input.pod) {
      quotation.pod = {
        name: input.pod.name.toUpperCase().trim(),
        code: input.pod.code?.toUpperCase().trim() || null,
        country: input.pod.country?.toUpperCase().trim() || "",
      };
    }
    if (input.containerType) quotation.containerType = input.containerType;
    if (input.incoterms) quotation.incoterms = input.incoterms;
    if (input.transportMode) quotation.transportMode = input.transportMode;
    if (input.lineItems) quotation.lineItems = input.lineItems;
    if (input.price !== undefined) quotation.price = input.price;
    if (input.remarks !== undefined) quotation.remarks = input.remarks?.trim() || "";
    if (input.validUntil) quotation.validUntil = new Date(input.validUntil);
    // AIR freight fields
    if (input.grossWeight !== undefined) quotation.grossWeight = input.grossWeight || undefined;
    if (input.cbm !== undefined) quotation.cbm = input.cbm || undefined;
    if (input.chargeableWeight !== undefined) quotation.chargeableWeight = input.chargeableWeight || undefined;

    await quotation.save();

    return {
      success: true,
      shortId: quotation.shortId,
    };
  } catch (error) {
    console.error("Error updating quotation:", error);
    return {
      success: false,
      error: "Failed to update quotation",
    };
  }
}

// ============================================
// DELETE QUOTATION
// ============================================
export async function deleteQuotation(
  shortId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Find quotation and verify ownership
    const quotation = await Quotation.findOne({ shortId });

    if (!quotation) {
      return {
        success: false,
        error: "Quotation not found",
      };
    }

    if (quotation.owner.toString() !== user._id.toString()) {
      return {
        success: false,
        error: "You don't have permission to delete this quotation",
      };
    }

    await Quotation.deleteOne({ shortId });

    // Optionally decrement usage count (keep it simple - don't decrement)
    // This prevents gaming the system by deleting and recreating

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting quotation:", error);
    return {
      success: false,
      error: "Failed to delete quotation",
    };
  }
}
