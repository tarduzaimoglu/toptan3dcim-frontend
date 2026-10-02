import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AccountServiceError, accountBackend } from '@/lib/server/account';
import LogoutButton from '@/components/account/LogoutButton';
export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  let result: any, unavailableCode = '';
  try { result = await accountBackend('me'); } catch (error) { result = { status: 503 }; unavailableCode = error instanceof AccountServiceError ? error.code : error instanceof TypeError || (error instanceof Error && ['AbortError','TimeoutError'].includes(error.name)) ? 'ACCOUNT_BACKEND_UNREACHABLE' : 'ACCOUNT_REQUEST_FAILED'; }
  if (result.status === 401) redirect('/hesap/giris');
  if (result.status !== 200) {
    unavailableCode ||= result.body?.code || '';
    const messages: Record<string, string> = {
      ACCOUNT_BFF_FEATURE_DISABLED: 'Hesap hizmeti ön yüzde kapalı olarak yapılandırılmış.',
      ACCOUNT_FEATURE_DISABLED: 'Hesap girişi şu anda bakım nedeniyle kapalı.',
      ACCOUNT_BACKEND_URL_MISSING: 'Hesap servisi bağlantısı yapılandırılmamış.',
      ACCOUNT_BFF_SECRET_MISSING_OR_INVALID: 'Hesap servisi güvenli bağlantı ayarı eksik.',
      ACCOUNT_PUBLIC_ORIGIN_MISSING: 'Hesap servisi site adresi yapılandırılmamış.',
      ACCOUNT_PUBLIC_ORIGIN_INVALID: 'Hesap servisi site adresi geçersiz.',
      ACCOUNT_BACKEND_UNREACHABLE: 'Hesap sunucusuna şu anda ulaşılamıyor.',
      ACCOUNT_REQUEST_FAILED: 'Hesap isteği tamamlanamadı. Lütfen daha sonra tekrar deneyin.',
    };
    return <div role="alert" className="mx-auto max-w-3xl px-4 py-12 text-slate-800"><h1 className="text-2xl font-bold">Hesabım</h1><p className="mt-3">{messages[unavailableCode] || 'Hesap hizmetine şu anda erişilemiyor. Lütfen daha sonra tekrar deneyin.'}</p><Link className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-purple-50 px-4 py-3 text-sm font-semibold text-[#7C3AED]" href="/hesap/giris">Giriş ve kayıt sayfası</Link></div>;
  }
  return <div className="mx-auto max-w-5xl px-4 py-10 text-slate-900">
    <div className="flex flex-wrap items-center justify-between gap-4"><h1 className="text-3xl font-bold">Hesabım</h1><LogoutButton /></div>
    <nav aria-label="Hesap menüsü" className="my-6 flex flex-wrap gap-2">{[['/hesap', 'Genel bakış'], ['/hesap/profil', 'Profil'], ['/hesap/adresler', 'Adreslerim'], ['/hesap/siparisler', 'Siparişlerim']].map(([href, label]) => <Link key={href} href={href} className="min-h-11 rounded-xl bg-purple-50 px-4 py-3 text-sm font-semibold text-[#7C3AED]">{label}</Link>)}</nav>
    <Link className="mb-5 mr-2 inline-flex min-h-11 items-center rounded-xl bg-purple-50 px-4 py-3 text-sm font-semibold text-[#7C3AED]" href="/hesap/figur-talepleri">Figür taleplerim</Link><Link className="mb-5 inline-flex min-h-11 items-center rounded-xl bg-purple-50 px-4 py-3 text-sm font-semibold text-[#7C3AED]" href="/hesap/tercihler">Tercihler ve veri</Link>
    {children}
  </div>;
}
