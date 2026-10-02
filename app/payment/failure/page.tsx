import { Suspense } from 'react';
import PaymentResult from '@/components/cart/PaymentResult';
export default function Page() { return <Suspense fallback={<p>Ödeme sonucu kontrol ediliyor…</p>}><PaymentResult /></Suspense>; }
