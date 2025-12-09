"use client";

import { sendBookingEmail } from "@/actions/send-booking";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Building2,
    Calendar,
    CheckCircle,
    Loader2,
    Mail,
    MessageSquare,
    Package,
    Phone,
    Send,
    User,
    Weight,
} from "lucide-react";
import { useState } from "react";

interface BookingRequestModalProps {
  quoteId: string;
  route: string;
  locale: string;
}

export default function BookingRequestModal({
  quoteId,
  route,
  locale,
}: BookingRequestModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [shipperCompany, setShipperCompany] = useState("");
  const [shipperName, setShipperName] = useState("");
  const [shipperEmail, setShipperEmail] = useState("");
  const [shipperPhone, setShipperPhone] = useState("");
  const [readyDate, setReadyDate] = useState("");
  const [commodity, setCommodity] = useState("");
  const [volume, setVolume] = useState("");
  const [message, setMessage] = useState("");

  const isKo = locale === "ko";

  const resetForm = () => {
    setShipperCompany("");
    setShipperName("");
    setShipperEmail("");
    setShipperPhone("");
    setReadyDate("");
    setCommodity("");
    setVolume("");
    setMessage("");
    setError(null);
    setIsSuccess(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form when closing
      setTimeout(resetForm, 300);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await sendBookingEmail({
        quoteId,
        shipperName,
        shipperCompany,
        shipperEmail,
        shipperPhone,
        readyDate,
        commodity,
        volume,
        message: message || undefined,
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      setIsSuccess(true);
      
      // Close modal after success animation
      setTimeout(() => {
        setOpen(false);
      }, 2000);
    } catch {
      setError(isKo ? "오류가 발생했습니다. 다시 시도해주세요." : "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate default date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 7);
  const defaultDate = tomorrow.toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-green-200/50"
        >
          <Send className="w-5 h-5 mr-2" />
          {isKo ? "부킹 요청하기" : "Book Now"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-green-600" />
            {isKo ? "부킹 요청" : "Booking Request"}
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            {isKo
              ? `${route} 구간에 대한 부킹을 요청합니다`
              : `Request a booking for ${route}`}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {isKo ? "부킹 요청이 전송되었습니다!" : "Booking Request Sent!"}
            </h3>
            <p className="text-sm text-slate-600">
              {isKo
                ? "포워더가 빠른 시일 내에 연락드릴 예정입니다."
                : "The forwarder will contact you soon."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {/* Company Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {isKo ? "회사명" : "Company Name"} *
              </label>
              <Input
                type="text"
                value={shipperCompany}
                onChange={(e) => setShipperCompany(e.target.value)}
                placeholder={isKo ? "회사명 입력" : "Enter company name"}
                required
                className="bg-white border-slate-300"
              />
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <User className="w-4 h-4" />
                {isKo ? "담당자명" : "Full Name"} *
              </label>
              <Input
                type="text"
                value={shipperName}
                onChange={(e) => setShipperName(e.target.value)}
                placeholder={isKo ? "담당자명 입력" : "Enter your full name"}
                required
                className="bg-white border-slate-300"
              />
            </div>

            {/* Email & Phone Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {isKo ? "이메일" : "Email"} *
                </label>
                <Input
                  type="email"
                  value={shipperEmail}
                  onChange={(e) => setShipperEmail(e.target.value)}
                  placeholder="email@company.com"
                  required
                  className="bg-white border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {isKo ? "전화번호" : "Phone"} *
                </label>
                <Input
                  type="tel"
                  value={shipperPhone}
                  onChange={(e) => setShipperPhone(e.target.value)}
                  placeholder="+82 10-1234-5678"
                  required
                  className="bg-white border-slate-300"
                />
              </div>
            </div>

            {/* Cargo Ready Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {isKo ? "화물 준비일" : "Cargo Ready Date"} *
              </label>
              <Input
                type="date"
                value={readyDate || defaultDate}
                onChange={(e) => setReadyDate(e.target.value)}
                required
                className="bg-white border-slate-300"
              />
            </div>

            {/* Commodity & Volume Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  {isKo ? "품목" : "Commodity"} *
                </label>
                <Input
                  type="text"
                  value={commodity}
                  onChange={(e) => setCommodity(e.target.value)}
                  placeholder={isKo ? "예: 전자제품" : "e.g., Electronics"}
                  required
                  className="bg-white border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Weight className="w-4 h-4" />
                  {isKo ? "물량" : "Volume"} *
                </label>
                <Input
                  type="text"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  placeholder={isKo ? "예: 2 x 40HQ" : "e.g., 2 x 40HQ"}
                  required
                  className="bg-white border-slate-300"
                />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                {isKo ? "메시지 (선택)" : "Message (Optional)"}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  isKo
                    ? "추가 요청사항이 있으시면 입력해주세요"
                    : "Any additional requirements or notes"
                }
                rows={3}
                className="w-full px-4 py-3 text-base border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {isKo ? "전송 중..." : "Sending..."}
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  {isKo ? "부킹 요청 보내기" : "Send Booking Request"}
                </>
              )}
            </Button>

            <p className="text-xs text-center text-slate-500">
              {isKo
                ? "포워더에게 귀하의 정보가 이메일로 전송됩니다"
                : "Your information will be sent to the forwarder via email"}
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
