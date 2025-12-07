"use server";

import { auth } from "@/lib/auth";
import { FREE_QUOTA_LIMIT, SUBSCRIPTION_STATUS } from "@/lib/constants";
import dbConnect from "@/lib/db";
import User from "@/models/User";

interface SubscriptionResult {
  success: boolean;
  subscriptionStatus?: string;
  usageCount?: number;
  canCreateQuotation?: boolean;
  quotasRemaining?: number;
  error?: string;
}

/**
 * Get the current user's subscription status
 */
export async function getSubscriptionStatus(): Promise<SubscriptionResult> {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized" };
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email }).lean();

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const isPro = user.subscriptionStatus === SUBSCRIPTION_STATUS.ACTIVE;
    const quotasRemaining = isPro
      ? Infinity
      : Math.max(0, FREE_QUOTA_LIMIT - user.usageCount);

    return {
      success: true,
      subscriptionStatus: user.subscriptionStatus,
      usageCount: user.usageCount,
      canCreateQuotation: isPro || user.usageCount < FREE_QUOTA_LIMIT,
      quotasRemaining: isPro ? -1 : quotasRemaining, // -1 means unlimited
    };
  } catch (error) {
    console.error("Error getting subscription status:", error);
    return { success: false, error: "Failed to get subscription status" };
  }
}

/**
 * Check if the current user can create a new quotation
 */
export async function checkCanCreateQuotation(): Promise<{
  canCreate: boolean;
  reason?: string;
}> {
  const result = await getSubscriptionStatus();

  if (!result.success) {
    return { canCreate: false, reason: result.error };
  }

  if (result.canCreateQuotation) {
    return { canCreate: true };
  }

  return {
    canCreate: false,
    reason: "Free quota limit reached. Please upgrade to Pro.",
  };
}
