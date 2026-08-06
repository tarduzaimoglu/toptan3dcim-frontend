// Fiyat gösterimini site genelinde açıp kapatmak için tek nokta.
// false yapıldığında ürün kartı, ürün detayı, sepet, checkout, WhatsApp
// mesajı ve yazdırılabilir sipariş föyünde fiyat/toplam alanları gizlenir.
// Strapi'den gelen fiyat verisi ve backend fiyat hesaplaması etkilenmez;
// bu sadece bir görünürlük anahtarıdır. Geri almak için true yapmak yeterli.
export const SHOW_PRICES = false;

export const PRICE_HIDDEN_TEXT =
  "Fiyat bilgisi için WhatsApp üzerinden iletişime geçebilirsiniz";
