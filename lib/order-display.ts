export const orderStatuses: Record<string, string> = { pending: 'Ödeme bekliyor', paid: 'Ödendi', failed: 'Ödeme başarısız', cancelled: 'İptal edildi', unknown: 'Ödeme sonucu doğrulanıyor' };
export const fulfillmentStatuses: Record<string, string> = { preparing: 'Hazırlanıyor', production: 'Üretimde', ready: 'Kargoya hazır', shipped: 'Kargoya verildi', delivered: 'Teslim edildi', cancelled: 'İptal edildi' };
export const money = (kurus: number, currency = 'TRY') => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: /^[A-Z]{3}$/.test(currency) ? currency : 'TRY' }).format(kurus / 100);
export const date = (value: string) => new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeZone: 'Europe/Istanbul' }).format(new Date(value));
