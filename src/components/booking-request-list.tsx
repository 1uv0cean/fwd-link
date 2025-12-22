"use client";

import { updateBookingStatus } from "@/actions/booking";
import { Button } from "@/components/ui/button";
import {
    Building2,
    Calendar,
    Check,
    ChevronDown,
    ChevronUp,
    Mail,
    Package,
    Phone,
    User,
    X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface BookingRequest {
  id: string;
  quoteShortId: string;
  route: string;
  shipperCompany: string;
  shipperName: string;
  shipperEmail: string;
  shipperPhone: string;
  readyDate: string;
  commodity: string;
  volume: string;
  message: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}

interface BookingRequestListProps {
  bookingRequests: BookingRequest[];
  locale: string;
}

export default function BookingRequestList({
  bookingRequests,
  locale,
}: BookingRequestListProps) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const isKo = locale === "ko";

  const handleStatusChange = async (
    bookingId: string,
    newStatus: "confirmed" | "cancelled"
  ) => {
    setLoadingId(bookingId);

    try {
      const result = await updateBookingStatus(bookingId, newStatus);

      if (result.success) {
        toast.success(
          newStatus === "confirmed"
            ? isKo
              ? "부킹이 확정되었습니다"
              : "Booking confirmed"
            : isKo
            ? "부킹이 취소되었습니다"
            : "Booking cancelled"
        );
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update status");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setLoadingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isKo ? "ko-KR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
            {isKo ? "대기" : "Pending"}
          </span>
        );
      case "confirmed":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
            {isKo ? "확정" : "Confirmed"}
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
            {isKo ? "취소" : "Cancelled"}
          </span>
        );
      default:
        return null;
    }
  };

  if (bookingRequests.length === 0) {
    return (
      <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center">
        <Package className="w-12 h-12 mx-auto mb-4 text-slate-300" />
        <p className="text-slate-500">
          {isKo
            ? "아직 부킹 요청이 없습니다"
            : "No booking requests yet"}
        </p>
        <p className="text-sm text-slate-400 mt-1">
          {isKo
            ? "견적서 링크를 공유하면 화주가 부킹을 요청할 수 있습니다"
            : "Share your quote links to receive booking requests"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookingRequests.map((booking) => (
        <div
          key={booking.id}
          className="rounded-xl bg-white border border-slate-200 overflow-hidden"
        >
          {/* Summary Row */}
          <div
            className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() =>
              setExpandedId(expandedId === booking.id ? null : booking.id)
            }
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-slate-800">
                    {booking.route}
                  </span>
                  {getStatusBadge(booking.status)}
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    {booking.shipperCompany}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(booking.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {expandedId === booking.id ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </div>
          </div>

          {/* Expanded Details */}
          {expandedId === booking.id && (
            <div className="border-t border-slate-100 p-4 bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Shipper Info */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {isKo ? "화주 정보" : "Shipper Info"}
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>{booking.shipperName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <a
                        href={`mailto:${booking.shipperEmail}`}
                        className="text-blue-600 hover:underline"
                      >
                        {booking.shipperEmail}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <a
                        href={`tel:${booking.shipperPhone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {booking.shipperPhone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Cargo Info */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {isKo ? "화물 정보" : "Cargo Info"}
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-slate-500">
                        {isKo ? "품목" : "Commodity"}:
                      </span>{" "}
                      {booking.commodity}
                    </div>
                    <div>
                      <span className="text-slate-500">
                        {isKo ? "물량" : "Volume"}:
                      </span>{" "}
                      {booking.volume}
                    </div>
                    <div>
                      <span className="text-slate-500">
                        {isKo ? "화물 준비일" : "Ready Date"}:
                      </span>{" "}
                      {formatDate(booking.readyDate)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Message */}
              {booking.message && (
                <div className="mb-4 p-3 rounded-lg bg-white border border-slate-200">
                  <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                    {isKo ? "메시지" : "Message"}
                  </h4>
                  <p className="text-sm text-slate-700">{booking.message}</p>
                </div>
              )}

              {/* Actions */}
              {booking.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(booking.id, "confirmed")}
                    disabled={loadingId === booking.id}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    {isKo ? "확정" : "Confirm"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(booking.id, "cancelled")}
                    disabled={loadingId === booking.id}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-1" />
                    {isKo ? "취소" : "Cancel"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                  >
                    <a href={`mailto:${booking.shipperEmail}?subject=Re: Booking Request for ${booking.route}`}>
                      <Mail className="w-4 h-4 mr-1" />
                      {isKo ? "이메일" : "Email"}
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
