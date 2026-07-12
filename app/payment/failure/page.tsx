"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";

const REASON_MESSAGES: Record<string, string> = {
  MISSING_CALLBACK_FIELDS: "Banka yanıtı eksik bilgiyle döndü. Lütfen tekrar deneyin.",
  ORDER_NOT_FOUND: "Siparişiniz bulunamadı. Lütfen ödemeyi tekrar başlatın.",
  POSNET_REQUEST_ERROR: "Bankaya bağlanırken bir sorun oluştu. Lütfen tekrar deneyin.",
  OOS_REQUEST_NOT_APPROVED: "Ödeme isteği banka tarafından onaylanmadı. Lütfen tekrar deneyin.",
  OOS_RESPONSE_INCOMPLETE: "Banka yanıtı eksik. Lütfen tekrar deneyin.",
  RESOLVE_REQUEST_ERROR: "Ödeme doğrulanırken bir sorun oluştu. Lütfen tekrar deneyin.",
  RESOLVE_NOT_APPROVED: "Ödeme banka tarafından onaylanmadı. Lütfen kart bilgilerinizi kontrol edip tekrar deneyin.",
  RESOLVE_DATA_MISSING: "Banka doğrulama verisi eksik. Lütfen tekrar deneyin.",
  MAC_MISMATCH: "Güvenlik doğrulaması başarısız oldu. Lütfen tekrar deneyin.",
  XID_AMOUNT_MISMATCH: "İşlem tutarı doğrulanamadı. Lütfen tekrar deneyin.",
  TRAN_REQUEST_ERROR: "İşlem tamamlanırken bir sorun oluştu. Lütfen tekrar deneyin.",
  TRAN_NOT_APPROVED: "Ödemeniz banka tarafından onaylanmadı. Lütfen kart bilgilerinizi kontrol edip tekrar deneyin.",
  TRAN_MAC_MISMATCH: "Güvenlik doğrulaması başarısız oldu. Lütfen tekrar deneyin.",
  UNEXPECTED_ERROR: "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
  failed: "Bu sipariş için ödeme daha önce tamamlanamadı. Lütfen yeni bir ödeme başlatın.",
};

function messageFor(reason: string | null) {
  if (!reason) {
    return "Ödemeniz gerçekleştirilemedi. Lütfen tekrar deneyin.";
  }
  if (reason.startsWith("MD_STATUS_")) {
    return "3D Secure doğrulaması tamamlanamadı. Lütfen kartınızın 3D Secure'a kayıtlı olduğundan emin olup tekrar deneyin.";
  }
  return REASON_MESSAGES[reason] || "Ödemeniz gerçekleştirilemedi. Lütfen tekrar deneyin veya bizimle iletişime geçin.";
}

function PaymentFailureContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const orderNumber = searchParams.get("order");

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-16 bg-white text-slate-900 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <XCircle className="h-9 w-9 text-red-600" />
      </div>

      <h1 className="mt-6 text-3xl font-semibold">Ödeme Tamamlanamadı</h1>
      <p className="mt-3 text-slate-700">{messageFor(reason)}</p>

      {orderNumber && (
        <div className="mt-6 inline-block rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4">
          <div className="text-sm text-slate-600">Sipariş Numarası</div>
          <div className="mt-1 text-xl font-bold tracking-wide">{orderNumber}</div>
        </div>
      )}

      <p className="mt-6 text-sm text-slate-600">
        Sepetiniz korunmaktadır. Sorun devam ederse WhatsApp veya e-posta üzerinden bizimle iletişime
        geçebilirsiniz.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/checkout"
          className="h-12 w-full sm:w-auto px-8 inline-flex items-center justify-center rounded-xl bg-[#7C3AED] text-white font-semibold hover:bg-[#6D28D9] transition-colors duration-300"
        >
          Tekrar Dene
        </Link>
        <Link
          href="/"
          className="h-12 w-full sm:w-auto px-8 inline-flex items-center justify-center rounded-xl border border-slate-300 font-semibold hover:bg-slate-50 transition-colors duration-300"
        >
          Anasayfaya Dön
        </Link>
      </div>
    </main>
  );
}

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={null}>
      <PaymentFailureContent />
    </Suspense>
  );
}
