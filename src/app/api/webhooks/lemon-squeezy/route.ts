
import { SUBSCRIPTION_STATUS } from "@/lib/constants";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

// Lemon Squeezy Webhook Event Types
type LemonSqueezyEventName =
  | "subscription_created"
  | "subscription_updated"
  | "subscription_cancelled"
  | "subscription_resumed"
  | "subscription_expired"
  | "subscription_paused"
  | "subscription_unpaused"
  | "subscription_payment_success"
  | "subscription_payment_failed"
  | "order_created";

interface LemonSqueezyWebhookPayload {
  meta: {
    event_name: LemonSqueezyEventName;
    custom_data?: {
      user_email?: string;
    };
  };
  data: {
    id: string;
    type: string;
    attributes: {
      status: string;
      customer_id: number;
      user_email?: string;
      // Subscription specific
      ends_at?: string | null;
      cancelled?: boolean;
    };
  };
}

/**
 * Verify the webhook signature from Lemon Squeezy
 */
function verifySignature(
  rawBody: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;

  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(rawBody).digest("hex");

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

/**
 * Map Lemon Squeezy subscription status to our internal status
 */
function mapSubscriptionStatus(
  eventName: LemonSqueezyEventName,
  attributes: LemonSqueezyWebhookPayload["data"]["attributes"]
): typeof SUBSCRIPTION_STATUS[keyof typeof SUBSCRIPTION_STATUS] {
  switch (eventName) {
    case "subscription_created":
    case "subscription_resumed":
    case "subscription_unpaused":
    case "subscription_payment_success":
      return SUBSCRIPTION_STATUS.ACTIVE;

    case "subscription_cancelled":
    case "subscription_expired":
      return SUBSCRIPTION_STATUS.FREE;

    case "subscription_payment_failed":
      return SUBSCRIPTION_STATUS.PAST_DUE;

    case "subscription_updated":
      // Check if subscription is still active
      if (attributes.status === "active") {
        return SUBSCRIPTION_STATUS.ACTIVE;
      } else if (attributes.status === "past_due") {
        return SUBSCRIPTION_STATUS.PAST_DUE;
      } else if (
        attributes.status === "cancelled" ||
        attributes.status === "expired"
      ) {
        return SUBSCRIPTION_STATUS.FREE;
      }
      return SUBSCRIPTION_STATUS.ACTIVE;

    default:
      return SUBSCRIPTION_STATUS.FREE;
  }
}

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

    if (!secret) {
      console.error("LEMON_SQUEEZY_WEBHOOK_SECRET is not set");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get("X-Signature");

    // Verify signature
    if (!verifySignature(rawBody, signature, secret)) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // Parse the payload
    const payload: LemonSqueezyWebhookPayload = JSON.parse(rawBody);
    const { meta, data } = payload;
    const eventName = meta.event_name;

    console.log(`Received Lemon Squeezy webhook: ${eventName}`);

    // Get user email from custom_data (passed during checkout)
    const userEmail = meta.custom_data?.user_email;

    if (!userEmail) {
      console.error("No user email in webhook payload");
      return NextResponse.json(
        { error: "Missing user email" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find and update the user
    const newStatus = mapSubscriptionStatus(eventName, data.attributes);

    const updateData: Record<string, unknown> = {
      subscriptionStatus: newStatus,
    };

    // Save subscription end date if present
    if (data.attributes.ends_at) {
      updateData.subscriptionEndDate = new Date(data.attributes.ends_at);
    }

    // Store Lemon Squeezy customer ID for future reference
    if (data.attributes.customer_id) {
      updateData.lemonCustomerId = String(data.attributes.customer_id);
    }

    const user = await User.findOneAndUpdate(
      { email: userEmail.toLowerCase() },
      { $set: updateData },
      { new: true }
    );

    if (!user) {
      console.error(`User not found for email: ${userEmail}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log(
      `Updated user ${userEmail} subscription status to: ${newStatus}`
    );

    // Return 200 immediately to acknowledge receipt
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
