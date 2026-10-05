import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AccountServiceError, accountBackend } from '@/lib/server/account';
import LogoutButton from '@/components/account/LogoutButton';
import AccountNav from '@/components/account/AccountNav';
import { Notice, secondaryButtonClass } from '@/components/account/ui';
export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  let result: Awaited<ReturnType<typeof accountBackend>>, unavailableCode = '';
  try { result = await accountBackend('me'); } catch (error) { result = { status: 503, body: {} }; unavailableCode = error instanceof AccountServiceError ? error.code : error instanceof TypeError || (error instanceof Error && ['AbortError','TimeoutError'].includes(error.name)) ? 'ACCOUNT_BACKEND_UNREACHABLE' : 'ACCOUNT_REQUEST_FAILED'; }
  if (result.status === 401) redirect('/hesap/giris');
  if (result.status !== 200) {
    unavailableCode ||= result.body?.code || '';
    const messages: Record<string, string> = {
      ACCOUNT_BFF_FEATURE_DISABLED: 'Hesap hizmeti şu anda kullanıma açılmamış.',
      ACCOUNT_FEATURE_DISABLED: 'Hesap girişi şu anda bakım nedeniyle kapalı.',
      ACCOUNT_BACKEND_URL_MISSING: 'Hesap servisi bağlantısı yapılandırılmamış.',
      ACCOUNT_BFF_SECRET_MISSING_OR_INVALID: 'Hesap servisi güvenli bağlantı ayarı eksik.',
      ACCOUNT_PUBLIC_ORIGIN_MISSING: 'Hesap servisi site adresi yapılandırılmamış.',
      ACCOUNT_PUBLIC_ORIGIN_INVALID: 'Hesap servisi site adresi geçersiz.',
      ACCOUNT_BACKEND_UNREACHABLE: 'Hesap sunucusuna şu anda ulaşılamıyor.',
      ACCOUNT_REQUEST_FAILED: 'Hesap isteği tamamlanamadı. Lütfen daha sonra tekrar deneyin.',
    };
    return <div className="account-workspace"><div className="mx-auto max-w-3xl px-4 py-12 text-slate-800"><h1 className="mb-5 text-3xl font-extrabold">Hesabım</h1><Notice kind="error"><p>{messages[unavailableCode] || 'Hesap hizmetine şu anda erişilemiyor. Lütfen daha sonra tekrar deneyin.'}</p></Notice><Link className={`${secondaryButtonClass} mt-5`} href="/hesap/giris">Giriş ve kayıt sayfası</Link></div></div>;
  }
  return <div className="account-workspace text-slate-900"><div className="account-shell">
    <div className="account-shell-header"><div><p className="account-eyebrow">Müşteri hesabı</p><h1>Hesabım</h1></div><LogoutButton /></div>
    <div className="account-shell-grid"><aside className="account-sidebar"><AccountNav /></aside><main className="account-content">{children}</main></div>
  </div></div>;
}
