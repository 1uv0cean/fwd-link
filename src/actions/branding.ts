"use server";

import { auth } from "@/lib/auth";
import { SUBSCRIPTION_STATUS } from "@/lib/constants";
import dbConnect from "@/lib/db";
import User, { type IBranding } from "@/models/User";

// Maximum logo size in bytes (500KB)
const MAX_LOGO_SIZE = 500 * 1024;

interface BrandingResult {
  success: boolean;
  branding?: IBranding;
  isPro?: boolean;
  error?: string;
}

interface UpdateBrandingInput {
  companyName?: string;
  logoBase64?: string;
  primaryColor?: string;
  contactEmail?: string;
  contactPhone?: string;
}

/**
 * Get current user's branding settings
 */
export async function getBranding(): Promise<BrandingResult> {
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

    // CRITICAL: Use JSON.parse/stringify to guarantee plain object
    // This removes ALL prototype methods including toJSON
    const result = {
      success: true as const,
      branding: {
        companyName: String(user.branding?.companyName || ""),
        logoBase64: String(user.branding?.logoBase64 || ""),
        primaryColor: String(user.branding?.primaryColor || ""),
        contactEmail: String(user.branding?.contactEmail || ""),
        contactPhone: String(user.branding?.contactPhone || ""),
      },
      isPro,
    };
    
    return JSON.parse(JSON.stringify(result)) as BrandingResult;
  } catch (error) {
    console.error("Error getting branding:", error);
    return { success: false, error: "Failed to get branding" };
  }
}

/**
 * Update user's branding settings (Pro only)
 */
export async function updateBranding(
  input: UpdateBrandingInput
): Promise<BrandingResult> {
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

    // Check Pro status
    if (user.subscriptionStatus !== SUBSCRIPTION_STATUS.ACTIVE) {
      return { success: false, error: "Pro subscription required" };
    }

    // Validate logo size if provided
    if (input.logoBase64) {
      // Base64 string is ~33% larger than original binary
      const estimatedSize = (input.logoBase64.length * 3) / 4;
      if (estimatedSize > MAX_LOGO_SIZE) {
        return { success: false, error: "Logo must be less than 500KB" };
      }
    }

    // Validate primary color format
    if (input.primaryColor && !/^#[0-9A-Fa-f]{6}$/.test(input.primaryColor)) {
      return { success: false, error: "Invalid color format. Use hex (e.g., #1e3a8a)" };
    }

    // Update branding
    user.branding = {
      companyName: input.companyName?.trim() || user.branding?.companyName,
      logoBase64: input.logoBase64 || user.branding?.logoBase64,
      primaryColor: input.primaryColor || user.branding?.primaryColor,
      contactEmail: input.contactEmail?.trim() || user.branding?.contactEmail,
      contactPhone: input.contactPhone?.trim() || user.branding?.contactPhone,
    };

    await user.save();

    // Return plain object to avoid serialization issues
    const result = {
      success: true as const,
      branding: {
        companyName: String(user.branding?.companyName || ""),
        logoBase64: String(user.branding?.logoBase64 || ""),
        primaryColor: String(user.branding?.primaryColor || ""),
        contactEmail: String(user.branding?.contactEmail || ""),
        contactPhone: String(user.branding?.contactPhone || ""),
      },
      isPro: true,
    };
    return JSON.parse(JSON.stringify(result)) as BrandingResult;
  } catch (error) {
    console.error("Error updating branding:", error);
    return { success: false, error: "Failed to update branding" };
  }
}

/**
 * Remove logo from branding
 */
export async function removeLogo(): Promise<BrandingResult> {
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

    if (user.subscriptionStatus !== SUBSCRIPTION_STATUS.ACTIVE) {
      return { success: false, error: "Pro subscription required" };
    }

    if (user.branding) {
      user.branding.logoBase64 = undefined;
      await user.save();
    }

    // Return plain object to avoid serialization issues
    const result = {
      success: true as const,
      branding: {
        companyName: String(user.branding?.companyName || ""),
        logoBase64: "",
        primaryColor: String(user.branding?.primaryColor || ""),
        contactEmail: String(user.branding?.contactEmail || ""),
        contactPhone: String(user.branding?.contactPhone || ""),
      },
      isPro: true,
    };
    return JSON.parse(JSON.stringify(result)) as BrandingResult;
  } catch (error) {
    console.error("Error removing logo:", error);
    return { success: false, error: "Failed to remove logo" };
  }
}

