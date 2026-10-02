/* eslint-disable @typescript-eslint/no-require-imports -- Executed directly by Node as a CommonJS test harness. */
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright-core');

async function main() {
  if (!process.env.CUSTOMER_STRAPI_INTERNAL_URL?.startsWith('http://127.0.0.1:') || process.env.CUSTOMER_MAIL_MODE !== 'file') throw new Error('E2E requires the isolated local backend harness');
  const origin = 'http://127.0.0.1:3210';
  const child = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'dev', '--hostname', '127.0.0.1', '--port', '3210'], {
    cwd: process.cwd(), windowsHide: true, env: { ...process.env, NODE_ENV: 'development', CUSTOMER_PUBLIC_ORIGIN: origin, NEXT_PUBLIC_STRAPI_URL: process.env.CUSTOMER_STRAPI_INTERNAL_URL,
      BACKEND_PROXY_URL: process.env.CUSTOMER_STRAPI_INTERNAL_URL, CUSTOMER_TRUSTED_CLIENT_IP_HEADER: 'x-e2e-client', NEXT_PUBLIC_PAYMENTS_ENABLED: 'true', NEXT_TELEMETRY_DISABLED: '1' }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = ''; child.stdout.on('data', b => { output += b.toString(); }); child.stderr.on('data', b => { output += b.toString(); });
  let browser;
  try {
    for (let i = 0; i < 90; i++) {
      if (child.exitCode !== null) throw new Error('Local Next server exited');
      try { const r = await fetch(origin + '/api/account/csrf'); if (r.ok) break; } catch {}
      if (i === 89) {
        const diagnostics = output.split(/\r?\n/).filter(line => /error|failed|invalid/i.test(line)).slice(-12).map(line => line.replace(/https?:\/\/[^\s]+/g, '[url]').replace(/[A-Za-z0-9_-]{40,}/g, '[redacted]')).join('\n');
        if (diagnostics) console.error(`Local Next startup diagnostics:\n${diagnostics}`);
        throw new Error('Local Next server did not become ready');
      }
      await new Promise(r => setTimeout(r, 1000));
    }
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'tr-TR' });
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      if (['localhost', '127.0.0.1'].includes(url.hostname) || ['data:', 'blob:'].includes(url.protocol)) return route.continue();
      return route.abort(); // Test never sends browser traffic to production or bank.
    });
    const page = await context.newPage();
    const email = `ui-${Date.now()}@example.test`, password = 'Browser local password 123!';
    async function noOverflow() { assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'mobile horizontal overflow'); }
    await page.goto(origin + '/kisiye-ozel-figur');
    await page.getByText('Funko tarzı standart figür boyutlarında.', { exact: true }).waitFor();
    await page.getByText('Renkli tek karakter', { exact: true }).waitFor();
    assert.match(await page.locator('body').innerText(), /₺2\.000/); assert.equal(await page.locator('main img').count(), 0); await noOverflow();
    await page.getByText('Renkli tek karakter', { exact: true }).click(); await page.getByRole('button', { name: '+ Kişi ekle' }).click();
    const sharp = require(path.resolve(process.cwd(), '../toptan3dcim-backend/node_modules/sharp'));
    const reference = await sharp({ create: { width: 8, height: 8, channels: 3, background: '#336699' } }).png().toBuffer();
    await page.locator('input[type=file]').setInputFiles({ name: 'reference.png', mimeType: 'image/png', buffer: reference });
    const filePreview = page.locator('figcaption').filter({ hasText: 'reference.png' });
    await filePreview.waitFor({ timeout: 5000 });
    await page.waitForFunction(async () => {
      const open = indexedDB.open('toptan3dcim-figurine-drafts-v1', 1);
      const db = await new Promise(resolve => { open.onsuccess = () => resolve(open.result); open.onerror = () => resolve(null); });
      if (!db) return false;
      const result = await new Promise(resolve => { const request = db.transaction('drafts').objectStore('drafts').get('current'); request.onsuccess = () => resolve(request.result); request.onerror = () => resolve(null); });
      db.close(); return result?.files?.some(file => file.name === 'reference.png' && file.blob instanceof Blob) === true;
    });
    await page.reload();
    await page.locator('figcaption').filter({ hasText: 'reference.png' }).waitFor(); await noOverflow();
    console.log('PASS UI: public mobile figurine page, CMS package price, optional gallery, IndexedDB File draft survives reload');
    async function mailLink() {
      const dir = path.resolve(process.cwd(), '../toptan3dcim-backend/.tmp/customer-mail');
      const names = await fs.readdir(dir);
      const matches = [];
      for (const name of names) { const m = JSON.parse(await fs.readFile(path.join(dir, name), 'utf8')); if (m.to === email) matches.push({ name, mail: m }); }
      matches.sort((a, b) => Number(b.name.split('.')[0]) - Number(a.name.split('.')[0]));
      assert.ok(matches.length); return matches[0].mail.text.match(/http[^\s]+/)[0].replace('http://localhost:3210', origin);
    }
    await page.goto(origin + '/hesap/kayit');
    await page.getByLabel('Ad soyad', { exact: true }).fill('Mobil Test');
    await page.getByLabel('E-posta', { exact: true }).fill(email);
    await page.locator('input[type=password]').nth(0).fill(password);
    await page.locator('input[type=password]').nth(1).fill('Different password 123!');
    await page.locator('form button').click();
    await page.locator('p[role=alert]').waitFor(); await noOverflow();
    await page.locator('input[type=password]').nth(1).fill(password);
    await page.locator('form button').click();
    await page.locator('[role=status]').waitFor();
    await page.goto(await mailLink());
    await page.locator('form button').waitFor();
    await page.waitForFunction(() => !window.location.hash);
    assert.ok(!page.url().includes('#'), 'link fragment removed after mounting');
    await page.locator('form button').click();
    await page.locator('[role=status]').waitFor();
    await page.goto(origin + '/hesap/giris?returnTo=https://evil.test');
    await page.getByLabel('E-posta', { exact: true }).fill(email); await page.locator('input[type=password]').first().fill(password);
    const loginResponse = page.waitForResponse(r => r.url().endsWith('/api/account/login') && r.request().method() === 'POST');
    await page.locator('form button').click();
    const loggedIn = await loginResponse; assert.equal(loggedIn.status(), 200);
    const cookieHeader = (await loggedIn.headersArray()).filter(h => h.name.toLowerCase() === 'set-cookie').map(h => h.value).join(';');
    assert.match(cookieHeader, /HttpOnly/i); assert.match(cookieHeader, /SameSite=Lax/i);
    const payload = await loggedIn.json(); assert.ok(!payload.sessionToken); assert.ok(!payload.jwt); assert.ok(!payload.refreshToken);
    await page.waitForURL(origin + '/hesap'); await page.getByRole('heading', { name: /Merhaba/ }).waitFor(); await noOverflow();
    console.log('PASS UI: mobile registration/error, verification, login, HttpOnly response, restricted redirect');

    await page.goto(origin + '/hesap/adresler'); await page.getByText('Henüz kayıtlı adresiniz yok.', { exact: false }).waitFor();
    await page.getByLabel('Adres adı', { exact: true }).fill('Mobil ev'); await page.getByLabel('Ad soyad', { exact: true }).fill('Mobil Test');
    await page.getByLabel('İl', { exact: true }).fill('İstanbul'); await page.getByLabel('İlçe', { exact: true }).fill('Kadıköy'); await page.getByLabel('Açık adres', { exact: true }).fill('Test sokak No 1');
    await page.getByLabel('Varsayılan teslimat adresim').check(); await page.getByRole('button', { name: 'Adresi kaydet' }).click();
    await page.getByRole('status').filter({ hasText: 'Adres kaydedildi' }).waitFor(); await noOverflow();
    await page.getByRole('button', { name: 'Düzenle', exact: true }).click(); await page.getByLabel('Açık adres', { exact: true }).fill('Test sokak No 2');
    await page.getByRole('button', { name: 'Adresi kaydet' }).click(); await page.getByText('Test sokak No 2,', { exact: false }).waitFor();
    await fs.mkdir('.tmp/customer-e2e', { recursive: true }); await page.screenshot({ path: '.tmp/customer-e2e/mobile-addresses.png', fullPage: true });
    page.once('dialog', dialog => dialog.accept()); await page.getByRole('button', { name: 'Sil', exact: true }).click();
    await page.getByRole('status').filter({ hasText: 'Adres silindi' }).waitFor();
    await page.getByText('Henüz kayıtlı adresiniz yok.', { exact: false }).waitFor();
    await page.goto(origin + '/hesap/siparisler'); await page.locator('main').first().waitFor(); assert.equal(await page.getByRole('link').filter({ hasText: process.env.CUSTOMER_TEST_ORDER_NUMBER }).count(), 0); await noOverflow();
    await page.setViewportSize({ width: 1440, height: 900 }); await page.goto(origin + '/hesap/profil');
    await page.getByLabel('Ad soyad', { exact: true }).fill('Updated UI Name'); await page.getByRole('button', { name: 'Profili kaydet' }).click(); await page.getByRole('status').filter({ hasText: 'Profiliniz güncellendi' }).waitFor();
    await page.screenshot({ path: '.tmp/customer-e2e/desktop-profile.png', fullPage: true });
    await page.goto(origin + '/hesap'); await page.locator('h1 + div button').click(); await page.waitForURL(origin + '/hesap/giris');
    await page.goto(origin + '/hesap/adresler'); await page.waitForURL(origin + '/hesap/giris');
    console.log('PASS UI: address create/edit/default, empty orders, desktop profile, logout, protected routes');

    await page.goto(origin + '/hesap/sifremi-unuttum'); await page.getByLabel('E-posta', { exact: true }).fill(email);
    await page.locator('form button').click(); await page.locator('[role=status]').waitFor();
    await page.goto(await mailLink()); await page.waitForFunction(() => !window.location.hash);
    await page.locator('input[type=password]').nth(0).fill('Updated browser password 456!'); await page.locator('input[type=password]').nth(1).fill('Updated browser password 456!');
    await page.locator('form button').click(); await page.locator('[role=status]').waitFor();
    console.log('PASS UI: forgotten password and one-use link reset forms');

    await page.goto(origin + '/hesap/giris'); await page.getByLabel('E-posta', { exact: true }).fill(process.env.CUSTOMER_TEST_ORDER_EMAIL);
    await page.getByLabel('E-posta', { exact: true }).fill(process.env.CUSTOMER_TEST_ORDER_EMAIL); await page.locator('input[type=password]').first().fill(process.env.CUSTOMER_TEST_ORDER_PASSWORD); await page.locator('form button').click(); await page.waitForURL(origin + '/hesap');
    await page.goto(origin + '/hesap/siparisler'); await page.getByRole('link').filter({ hasText: process.env.CUSTOMER_TEST_ORDER_NUMBER }).click();
    await page.getByRole('heading', { name: process.env.CUSTOMER_TEST_ORDER_NUMBER }).waitFor();
    await page.getByText('Original address, Kadıköy, İstanbul', { exact: true }).waitFor();
    assert.ok(!(await page.locator('body').innerText()).includes('internalCost'));
    await page.screenshot({ path: '.tmp/customer-e2e/order-detail.png', fullPage: true });
    await page.locator('h1 + div button').click(); await page.waitForURL(origin + '/hesap/giris');
    console.log('PASS UI: existing account-owned order list/detail shows original snapshot');

    const noCsrf = await page.request.post(origin + '/api/account/login', { data: { email, password }, headers: { Origin: origin } }); assert.equal(noCsrf.status(), 403);
    const csrf = await page.request.get(origin + '/api/account/csrf'); const ticket = (await csrf.json()).token;
    const badOrigin = await page.request.post(origin + '/api/account/login', { data: { email, password }, headers: { Origin: 'https://evil.test', 'x-csrf-token': ticket } }); assert.equal(badOrigin.status(), 403);
    const bypass = await page.request.get(origin + '/backend/api/orders'); assert.equal(bypass.status(), 404);
    const direct = await page.request.post(origin + '/backend/api/customer/dispatch', { data: { operation: 'login', data: { email, password } } }); assert.equal(direct.status(), 404);
    console.log('PASS HTTP: actual Next CSRF/Origin rejection and /backend rewrite boundary');

    // Bank transport stays mocked inside the isolated Strapi harness.
    await page.goto(origin + '/cart');
    await page.waitForFunction(() => document.querySelector('main[aria-busy]')?.getAttribute('aria-busy') === 'false');
    await page.evaluate(id => localStorage.setItem('kesiolabs_cart_v1', JSON.stringify({ items: [{ id, productId: id, qty: 2, variant: { colorName: 'Mavi' }, product: { id, title: 'Guest regression product', wholesalePrice: 50, minQty: 2 } }] })), process.env.CUSTOMER_TEST_PRODUCT_ID);
    await page.reload(); await page.getByText('Guest regression product', { exact: false }).first().waitFor();
    await page.goto(origin + '/checkout'); await page.locator('form').waitFor();
    await page.getByPlaceholder('Ad Soyad', { exact: true }).fill('Guest Checkout'); await page.getByPlaceholder('E-posta', { exact: true }).fill('guest@example.test');
    assert.equal(new URL(page.url()).pathname, '/checkout');
    await page.setViewportSize({ width: 390, height: 844 }); await noOverflow();
    console.log('PASS UI: existing guest localStorage cart and account-free checkout remain usable');
    await page.locator('form input').nth(2).fill('5551234567');
    await page.locator('form input').nth(3).fill('Istanbul'); await page.locator('form input').nth(4).fill('Kadikoy'); await page.locator('form input').nth(5).fill('Guest snapshot address');
    await page.locator('form input[type=checkbox]').check(); await page.locator('form button').click();
    await page.locator('form .bg-violet-50').waitFor(); await noOverflow();
    await page.screenshot({ path: '.tmp/customer-e2e/mobile-checkout.png', fullPage: true });
    await page.route('https://bank.invalid/**', route => route.fulfill({ status: 200, contentType: 'text/html', body: '<p>Mock bank test page</p>' }));
    let capture;
    const checkoutResponse = new Promise(resolve => { capture = resolve; });
    await page.route('**/api/account/checkout', async route => { const response = await route.fetch(); const body = await response.json(); capture({ status: response.status(), body }); await route.fulfill({ response }); });
    await page.locator('form button').click();
    const initiated = await checkoutResponse; assert.equal(initiated.status, 200); const pending = initiated.body;
    await page.waitForURL('https://bank.invalid/**');
    await page.goto(origin + '/payment/success?order=' + encodeURIComponent(pending.orderNumber));
    await page.locator('main').first().waitFor();
    assert.ok(!(await page.locator('body').innerText()).includes('Ödemeniz başarıyla'));
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('kesiolabs_cart_v1')).items[0].qty), 2);
    await page.goto(origin + '/payment/success?order=OTHER-CUSTOMER'); await page.locator('p[role=alert]').waitFor();
    console.log('PASS UI: mobile guest quote/confirmation, mocked initiation, direct success is not proof, other-order result isolation');
    await page.goto(origin + '/hesap/giris'); await page.getByLabel('E-posta', { exact: true }).fill(process.env.CUSTOMER_TEST_ORDER_EMAIL); await page.locator('input[type=password]').first().fill(process.env.CUSTOMER_TEST_ORDER_PASSWORD); await page.locator('form button').click(); await page.waitForURL(origin + '/hesap');

    await page.goto(origin + '/cart'); await page.getByText('Commerce fixture', { exact: false }).first().waitFor();
    await page.waitForFunction(() => !localStorage.getItem('kesiolabs_cart_v1'));
    await page.goto(origin + '/hesap/adresler');
    const existingAddresses = await (await page.request.get(origin + '/api/account/addresses')).json();
    if (!Array.isArray(existingAddresses.addresses) || existingAddresses.addresses.length === 0) {
      await page.getByLabel('Adres adı', { exact: true }).fill('Checkout fixture'); await page.getByLabel('Ad soyad', { exact: true }).fill('Checkout fixture');
      await page.getByLabel('İl', { exact: true }).fill('İstanbul'); await page.getByLabel('İlçe', { exact: true }).fill('Kadıköy'); await page.getByLabel('Açık adres', { exact: true }).fill('Saved checkout address');
      await page.getByLabel('Varsayılan teslimat adresim').check(); await page.getByRole('button', { name: 'Adresi kaydet' }).click(); await page.getByRole('status').filter({ hasText: 'Adres kaydedildi' }).waitFor();
    }
    const cart = await (await page.request.get(origin + '/api/account/cart')).json(); assert.equal(cart.cart.lines[0].qty, 5);
    await page.reload(); const afterReload = await (await page.request.get(origin + '/api/account/cart')).json(); assert.equal(afterReload.cart.lines[0].qty, 5);
    await page.goto(origin + '/checkout'); await page.locator('select').first().waitFor();
    await page.locator('select').first().waitFor(); assert.ok(await page.locator('select').first().inputValue()); await noOverflow();
    await page.screenshot({ path: '.tmp/customer-e2e/member-checkout.png', fullPage: true });
    const device = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await device.route('**/*', route => ['localhost','127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue({ headers: { ...route.request().headers(), 'x-e2e-client': 'second-device' } }) : route.abort());
    const second = await device.newPage(); await second.goto(origin + '/hesap/giris'); await second.getByLabel('E-posta', { exact: true }).fill(process.env.CUSTOMER_TEST_ORDER_EMAIL); await second.locator('input[type=password]').first().fill(process.env.CUSTOMER_TEST_ORDER_PASSWORD); await second.locator('form button').click(); await second.waitForURL(origin + '/hesap');
    const otherCart = await (await second.request.get(origin + '/api/account/cart')).json(); assert.equal(otherCart.cart.lines[0].qty, 5);
    await second.goto(origin + '/hesap'); await second.locator('h1 + div button').click(); await second.waitForURL(origin + '/hesap/giris');
    await second.goto(origin + '/cart'); await second.getByText('Commerce fixture', { exact: false }).waitFor({ state: 'hidden' });
    assert.ok(!await second.evaluate(() => localStorage.getItem('kesiolabs_cart_v1')?.includes('Commerce fixture')));
    await device.close();
    for (const path of ['/backend/api/payment/initiate','/backend/api/payment-attempts','/backend/api/customer-carts']) assert.equal((await page.request.get(origin + path)).status(),404);
    assert.equal((await page.request.post(origin + '/api/account/checkout', { data: {}, headers: { Origin: origin } })).status(),403);
    console.log('PASS UI/HTTP: member merge once, reload/second device persistence, saved address selection, logout privacy and checkout boundary');
    console.log('Completed local account and commerce E2E tests. All bank responses were mocked; real bank traffic was blocked.');
  } catch (e) {
    // Do not print raw server output, request bodies, cookie headers or mail links.
    console.error(e.stack?.split("`n").slice(0, 8).join("`n")); throw new Error('Account E2E failed');
  } finally {
    if (browser) await browser.close();
    if (child.exitCode === null) {
      const stopped = new Promise(resolve => child.once('exit', resolve));
      child.kill(); await Promise.race([stopped, new Promise(resolve => setTimeout(resolve, 5000))]);
    }
  }
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });

