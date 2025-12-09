"use server";

import { APP_NAME } from "@/lib/constants";
import dbConnect from "@/lib/db";
import Quotation from "@/models/Quotation";
import User from "@/models/User";
import { Resend } from "resend";

// Types
interface BookingRequestInput {
  quoteId: string;
  shipperName: string;
  shipperCompany: string;
  shipperEmail: string;
  shipperPhone: string;
  readyDate: string;
  commodity: string;
  volume: string;
  message?: string;
}

interface BookingResult {
  success: boolean;
  message: string;
}

/**
 * Send a booking request email to the Forwarder (Quote Owner)
 */
export async function sendBookingEmail(
  input: BookingRequestInput
): Promise<BookingResult> {
  try {
    // Validate API key
    const apiKey = process.env.AUTH_RESEND_KEY;
    if (!apiKey) {
      console.error("AUTH_RESEND_KEY is not configured");
      return {
        success: false,
        message: "Email service is not configured. Please contact support.",
      };
    }

    // Initialize Resend client inside function
    const resend = new Resend(apiKey);
    // Validate required fields
    if (!input.quoteId || !input.shipperEmail || !input.shipperName) {
      return {
        success: false,
        message: "Missing required fields",
      };
    }

    await dbConnect();

    // Fetch the quotation and owner
    const quotation = await Quotation.findOne({ shortId: input.quoteId })
      .populate("owner", "email name")
      .lean();

    if (!quotation) {
      return {
        success: false,
        message: "Quote not found",
      };
    }

    // Get forwarder email from populated owner or fetch separately
    let forwarderEmail: string;
    let forwarderName: string;

    if (quotation.owner && typeof quotation.owner === "object" && "email" in quotation.owner) {
      forwarderEmail = (quotation.owner as { email: string; name?: string }).email;
      forwarderName = (quotation.owner as { email: string; name?: string }).name || "Forwarder";
    } else {
      // Fallback: fetch user separately
      const owner = await User.findById(quotation.owner).lean();
      if (!owner) {
        return {
          success: false,
          message: "Quote owner not found",
        };
      }
      forwarderEmail = owner.email;
      forwarderName = owner.name;
    }

    // Build route string
    const polName = typeof quotation.pol === "object" ? quotation.pol.name : quotation.pol;
    const podName = typeof quotation.pod === "object" ? quotation.pod.name : quotation.pod;
    const route = `${polName} → ${podName}`;

    // Build email HTML
    const emailHtml = buildBookingEmailHtml({
      quoteNumber: input.quoteId,
      route,
      shipperName: input.shipperName,
      shipperCompany: input.shipperCompany,
      shipperEmail: input.shipperEmail,
      shipperPhone: input.shipperPhone,
      readyDate: input.readyDate,
      commodity: input.commodity,
      volume: input.volume,
      message: input.message,
      forwarderName,
    });

    // Send email via Resend
    const fromEmail = process.env.AUTH_RESEND_FROM || `${APP_NAME} <noreply@fwdlink.io>`;

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: forwarderEmail,
      subject: `[Booking Request] New Booking for Quote #${input.quoteId}`,
      html: emailHtml,
      replyTo: input.shipperEmail,
    });

    if (error) {
      console.error("Resend error:", error);
      return {
        success: false,
        message: "Failed to send email. Please try again.",
      };
    }

    return {
      success: true,
      message: "Booking request sent successfully!",
    };
  } catch (error) {
    console.error("Error sending booking email:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Build the HTML email template for booking requests
 */
function buildBookingEmailHtml(data: {
  quoteNumber: string;
  route: string;
  shipperName: string;
  shipperCompany: string;
  shipperEmail: string;
  shipperPhone: string;
  readyDate: string;
  commodity: string;
  volume: string;
  message?: string;
  forwarderName: string;
}): string {
  const messageSection = data.message
    ? `
      <tr>
        <td style="padding: 16px 24px; background-color: #f8fafc; border-radius: 8px;">
          <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Message from Shipper</p>
          <p style="margin: 0; font-size: 14px; color: #334155; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(data.message)}</p>
        </td>
      </tr>
      <tr><td style="height: 24px;"></td></tr>
    `
    : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Booking Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f1f5f9;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #f1f5f9;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; color: #1e293b; font-size: 24px; font-weight: 700;">🚢 New Booking Request Received</h1>
              <p style="margin: 12px 0 0 0; color: #93c5fd; font-size: 14px;">A shipper has requested a booking for your quote</p>
            </td>
          </tr>

          <!-- Quote Reference -->
          <tr>
            <td style="padding: 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #eff6ff; border-radius: 12px; border: 1px solid #bfdbfe;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
                      <tr>
                        <td style="width: 50%;">
                          <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.5px;">Quote Reference</p>
                          <p style="margin: 0; font-size: 18px; font-weight: 700; color: #1e3a8a;">#${escapeHtml(data.quoteNumber)}</p>
                        </td>
                        <td style="width: 50%; text-align: right;">
                          <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.5px;">Route</p>
                          <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1e3a8a;">${escapeHtml(data.route)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipper Details -->
          <tr>
            <td style="padding: 0 24px;">
              <p style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #1e293b;">Shipper Information</p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 16px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; width: 40%;">
                    <span style="font-size: 13px; color: #64748b;">Company</span>
                  </td>
                  <td style="padding: 12px 16px; background-color: #ffffff; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-size: 14px; font-weight: 600; color: #1e293b;">${escapeHtml(data.shipperCompany)}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-size: 13px; color: #64748b;">Contact Name</span>
                  </td>
                  <td style="padding: 12px 16px; background-color: #ffffff; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-size: 14px; font-weight: 600; color: #1e293b;">${escapeHtml(data.shipperName)}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-size: 13px; color: #64748b;">Email</span>
                  </td>
                  <td style="padding: 12px 16px; background-color: #ffffff; border-bottom: 1px solid #e2e8f0;">
                    <a href="mailto:${escapeHtml(data.shipperEmail)}" style="font-size: 14px; color: #2563eb; text-decoration: none;">${escapeHtml(data.shipperEmail)}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #f8fafc;">
                    <span style="font-size: 13px; color: #64748b;">Phone</span>
                  </td>
                  <td style="padding: 12px 16px; background-color: #ffffff;">
                    <span style="font-size: 14px; color: #1e293b;">${escapeHtml(data.shipperPhone)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr><td style="height: 24px;"></td></tr>

          <!-- Cargo Details -->
          <tr>
            <td style="padding: 0 24px;">
              <p style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #1e293b;">Cargo Information</p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 16px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; width: 40%;">
                    <span style="font-size: 13px; color: #64748b;">Commodity</span>
                  </td>
                  <td style="padding: 12px 16px; background-color: #ffffff; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-size: 14px; font-weight: 600; color: #1e293b;">${escapeHtml(data.commodity)}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-size: 13px; color: #64748b;">Volume</span>
                  </td>
                  <td style="padding: 12px 16px; background-color: #ffffff; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-size: 14px; font-weight: 600; color: #1e293b;">${escapeHtml(data.volume)}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #f8fafc;">
                    <span style="font-size: 13px; color: #64748b;">Cargo Ready Date</span>
                  </td>
                  <td style="padding: 12px 16px; background-color: #ffffff;">
                    <span style="font-size: 14px; font-weight: 600; color: #1e293b;">${escapeHtml(data.readyDate)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr><td style="height: 24px;"></td></tr>

          <!-- Message Section (if exists) -->
          ${messageSection}

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 24px 32px 24px; text-align: center;">
              <a href="mailto:${escapeHtml(data.shipperEmail)}?subject=Re: Booking Request for Quote %23${escapeHtml(data.quoteNumber)}" 
                 style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #1e293b; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 12px; box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.4);">
                ✉️ Reply to Shipper
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b;">
                This booking request was sent via <strong>FwdLink</strong>
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                © ${new Date().getFullYear()} FwdLink. Professional freight quotes in 10 seconds.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}
