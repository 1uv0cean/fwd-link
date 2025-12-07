"use server";

import { auth } from "@/lib/auth";
import { ERROR_CODES, FREE_QUOTA_LIMIT, SUBSCRIPTION_STATUS } from "@/lib/constants";
import dbConnect from "@/lib/db";
import Quotation, { type ContainerType, type IPort } from "@/models/Quotation";
import User from "@/models/User";
import { nanoid } from "nanoid";

interface CreateQuotationInput {
  pol: IPort;
  pod: IPort;
  containerType: ContainerType;
  price: number;
  remarks?: string;
  validUntil: Date;
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

    // Create the quotation (USD only)
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
      price: input.price,
      remarks: input.remarks?.trim() || "",
      validUntil: new Date(input.validUntil),
      views: 0,
    });

    // ============================================
    // ATOMIC INCREMENT - Prevent race conditions
    // ============================================
    await User.findByIdAndUpdate(user._id, {
      $inc: { usageCount: 1 },
    });

    return {
      success: true,
      shortId: quotation.shortId,
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

    return {
      success: true,
      quotation: {
        shortId: quotation.shortId,
        pol: quotation.pol,
        pod: quotation.pod,
        containerType: quotation.containerType || "40HQ",
        price: quotation.price,
        remarks: quotation.remarks || "",
        validUntil: quotation.validUntil.toISOString(),
        views: quotation.views + (options.incrementView ? 1 : 0),
      },
    };
  } catch (error) {
    console.error("Error fetching quotation:", error);
    return { success: false, error: "Failed to fetch quotation" };
  }
}

export async function getUserQuotations() {
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

    const quotations = await Quotation.find({ owner: user._id })
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
        price: q.price,
        remarks: q.remarks || "",
        validUntil: q.validUntil.toISOString(),
        views: q.views,
        createdAt: q.createdAt.toISOString(),
      })),
      usageCount: user.usageCount,
      subscriptionStatus: user.subscriptionStatus,
    };
  } catch (error) {
    console.error("Error fetching user quotations:", error);
    return { success: false, error: "Failed to fetch quotations" };
  }
}
