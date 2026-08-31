const WHATSAPP_PHONE = "905465868005";

export function buildQuoteWhatsAppUrl(details: string) {
  const message = `Merhaba, Toptan3Dcim'de STL dosyam için teklif oluşturdum.\n\n${details}\n\nÜretim ve net fiyatlandırma konusunda yardımcı olabilir misiniz?`;
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}
