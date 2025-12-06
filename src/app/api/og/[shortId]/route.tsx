import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

// Note: This route generates OG images without database access.
// The quote data is passed via searchParams for edge compatibility.
// The actual quote page will provide the data.

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortId: string }> }
) {
  try {
    const { shortId } = await params;
    const { searchParams } = request.nextUrl;

    // Get quote data from URL params (set by the quote view page)
    const pol = searchParams.get("pol") || "ORIGIN";
    const pod = searchParams.get("pod") || "DESTINATION";
    const price = searchParams.get("price") || "0";
    const currency = searchParams.get("currency") || "USD";
    const validUntil = searchParams.get("validUntil") || "";

    // Format price
    const formattedPrice = currency === "KRW"
      ? `₩${Number(price).toLocaleString("ko-KR")}`
      : `$${Number(price).toLocaleString("en-US")}`;

    // Format date
    const validDate = validUntil
      ? new Date(validUntil).toLocaleDateString(
          currency === "KRW" ? "ko-KR" : "en-US",
          { year: "numeric", month: "short", day: "numeric" }
        )
      : "";

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            color: "white",
            fontFamily: "sans-serif",
            padding: 60,
          }}
        >
          {/* Logo/Brand */}
          <div
            style={{
              position: "absolute",
              top: 40,
              left: 60,
              fontSize: 32,
              fontWeight: "bold",
              color: "#4facfe",
            }}
          >
            FwdLink
          </div>

          {/* Route */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 72,
              fontWeight: "bold",
              marginBottom: 40,
              color: "#ffffff",
            }}
          >
            {pol}
            <span
              style={{
                margin: "0 30px",
                color: "#4facfe",
              }}
            >
              ➔
            </span>
            {pod}
          </div>

          {/* Price - The Star */}
          <div
            style={{
              display: "flex",
              fontSize: 120,
              fontWeight: "bold",
              background: "linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)",
              backgroundClip: "text",
              color: "transparent",
              marginBottom: 40,
            }}
          >
            {formattedPrice}
          </div>

          {/* Valid Until */}
          {validDate && (
            <div
              style={{
                fontSize: 28,
                color: "#a0a0a0",
              }}
            >
              Valid until {validDate}
            </div>
          )}
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("Error generating OG image:", error);
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "#1a1a2e",
            color: "white",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ fontSize: 48, fontWeight: "bold" }}>FwdLink</div>
          <div style={{ fontSize: 24, marginTop: 20, color: "#a0a0a0" }}>
            Freight Quotation
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}
