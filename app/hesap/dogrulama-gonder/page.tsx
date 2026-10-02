import AuthForm from '@/components/account/AuthForm';
export const metadata = { robots: { index: false, follow: false } };
export default function Page() { return <AuthForm mode="resend" />; }
