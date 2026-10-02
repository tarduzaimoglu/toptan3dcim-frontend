export async function accountRequest(operation: string, data?: unknown) {
  let headers: Record<string, string> | undefined;
  if (data !== undefined) {
    const csrf = await fetch('/api/account/csrf', { cache: 'no-store' });
    const ticket = await csrf.json();
    if (!csrf.ok) throw new Error(ticket.message || 'Hesap hizmetine erişilemiyor.');
    headers = { 'Content-Type': 'application/json', 'x-csrf-token': ticket.token };
  }
  const response = await fetch(`/api/account/${operation}`, { method: data === undefined ? 'GET' : 'POST', cache: 'no-store', headers, body: data === undefined ? undefined : JSON.stringify(data) });
  const result = await response.json();
  if (!response.ok) {
    if (response.status === 401 && operation !== 'login') window.dispatchEvent(new Event('customer-session-changed'));
    throw new Error(result.message || 'İşlem tamamlanamadı.');
  }
  return result;
}
