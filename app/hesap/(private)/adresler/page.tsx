import AddressManager from '@/components/account/AddressManager';
import { accountBackend } from '@/lib/server/account';
export default async function Page() {
  let result;
  try { result = await accountBackend('addresses'); }
  catch { result = null; }
  if (!result) return <p role="alert">Adresler yüklenemedi. Lütfen tekrar deneyin.</p>;
  return result.status === 200 ? <AddressManager initial={result.body.addresses} /> : <p role="alert">{result.body.message}</p>;
}
