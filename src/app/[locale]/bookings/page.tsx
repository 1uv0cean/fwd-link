import { getBookingRequests } from "@/actions/booking";
import BookingRequestList from "@/components/booking-request-list";
import { auth } from "@/lib/auth";
import { ArrowLeft, Package } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function BookingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/auth/signin`);
  }

  const result = await getBookingRequests();
  const bookingRequests = result.success ? result.bookingRequests || [] : [];

  const isKo = locale === "ko";

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/dashboard`}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {isKo ? "대시보드로 돌아가기" : "Back to Dashboard"}
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Package className="w-7 h-7 text-green-600" />
            {isKo ? "부킹 요청 관리" : "Booking Requests"}
          </h1>
          <p className="text-slate-500 mt-2">
            {isKo
              ? "화주로부터 받은 부킹 요청을 관리하세요"
              : "Manage booking requests from shippers"}
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-white border border-slate-200 text-center">
            <div className="text-2xl font-bold text-slate-800">
              {bookingRequests.filter((r) => r.status === "pending").length}
            </div>
            <div className="text-sm text-amber-600 font-medium">
              {isKo ? "대기 중" : "Pending"}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 text-center">
            <div className="text-2xl font-bold text-slate-800">
              {bookingRequests.filter((r) => r.status === "confirmed").length}
            </div>
            <div className="text-sm text-green-600 font-medium">
              {isKo ? "확정" : "Confirmed"}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 text-center">
            <div className="text-2xl font-bold text-slate-800">
              {bookingRequests.length}
            </div>
            <div className="text-sm text-slate-500 font-medium">
              {isKo ? "전체" : "Total"}
            </div>
          </div>
        </div>

        {/* Booking List */}
        <BookingRequestList bookingRequests={bookingRequests} locale={locale} />
      </div>
    </main>
  );
}
