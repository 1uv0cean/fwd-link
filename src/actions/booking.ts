"use server";

import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import BookingRequest, { type BookingStatus } from "@/models/BookingRequest";
import User from "@/models/User";

// Get all booking requests for the logged-in forwarder
export async function getBookingRequests() {
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

    const bookingRequests = await BookingRequest.find({ owner: user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return {
      success: true,
      bookingRequests: bookingRequests.map((req) => ({
        id: req._id.toString(),
        quoteShortId: req.quoteShortId,
        route: req.route,
        shipperCompany: req.shipperCompany,
        shipperName: req.shipperName,
        shipperEmail: req.shipperEmail,
        shipperPhone: req.shipperPhone,
        readyDate: req.readyDate.toISOString(),
        commodity: req.commodity,
        volume: req.volume,
        message: req.message || "",
        status: req.status,
        createdAt: req.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching booking requests:", error);
    return { success: false, error: "Failed to fetch booking requests" };
  }
}

// Update booking request status
export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
) {
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

    const bookingRequest = await BookingRequest.findById(bookingId);

    if (!bookingRequest) {
      return { success: false, error: "Booking request not found" };
    }

    // Verify ownership
    if (bookingRequest.owner.toString() !== user._id.toString()) {
      return { success: false, error: "Unauthorized" };
    }

    bookingRequest.status = status;
    await bookingRequest.save();

    return { success: true };
  } catch (error) {
    console.error("Error updating booking status:", error);
    return { success: false, error: "Failed to update status" };
  }
}
