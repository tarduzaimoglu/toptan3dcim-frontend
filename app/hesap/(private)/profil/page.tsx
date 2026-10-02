import ProfileForm from '@/components/account/ProfileForm';
import { currentCustomer } from '@/lib/server/account';
export default async function Page() {
  const customer = await currentCustomer();
  return customer ? <ProfileForm initial={customer} /> : <p role="alert">Oturumunuzu kontrol etmek için sayfayı yenileyin.</p>;
}
