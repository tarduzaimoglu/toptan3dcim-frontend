"use client";
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { accountRequest } from '@/lib/account-client';
import { clearFigurineDraft, readFigurineDraft, writeFigurineDraft, type DraftFile } from '@/lib/figurine-draft';

type Package = { id: string; key: string; title: string; description: string; style: 'color'|'monochrome'|'custom'; characters: number; pets: number; startingPrice: number|null; priceLabel: string; priceKind: string; gallery: {url:string;alt:string}[] };
type Person = { id: string; kind: 'person'|'pet'; description: string; outfit?: string; pose: string; hair?: string; accessories?: string; appearance?: string; distinctiveFeatures?: string; fileKeys: string[] };
type RequestSuccess = { requestId: string; requestNumber: string; message: string };
const input = 'mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white p-3 text-base text-slate-900 outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-100';
const card = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6';
const freshPerson = (kind: 'person'|'pet'): Person => ({ id: crypto.randomUUID(), kind, description: '', pose: '', fileKeys: [], ...(kind === 'person' ? { outfit: '', hair: '', accessories: '' } : { appearance: '', distinctiveFeatures: '' }) });

export default function FigurineRequestForm() {
  const [packages, setPackages] = useState<Package[]>([]), [privacy, setPrivacy] = useState(''), [privacyVersion, setPrivacyVersion] = useState(''), [submissionEnabled, setSubmissionEnabled] = useState(false);
  const [priceNote, setPriceNote] = useState(''), [customerNote, setCustomerNote] = useState('');
  const [limits, setLimits] = useState({ fileBytes: 10*1024*1024, files: 10, totalBytes: 50*1024*1024 });
  const [style, setStyle] = useState<'color'|'monochrome'>('color'), [packageId, setPackageId] = useState('');
  const [people, setPeople] = useState<Person[]>([]), [files, setFiles] = useState<DraftFile[]>([]);
  const [fullName, setFullName] = useState(''), [preference, setPreference] = useState<'email'|'whatsapp'>('email'), [phone, setPhone] = useState('');
  const [base, setBase] = useState(''), [plinthText, setPlinthText] = useState(''), [note, setNote] = useState(''), [consent, setConsent] = useState(false);
  const [account, setAccount] = useState<{email:string;fullName:string;phone:string}|null>(null), [boundEmail, setBoundEmail] = useState<string|null>(null), [needsAccountConfirm, setNeedsAccountConfirm] = useState(false);
  const [authMode, setAuthMode] = useState<'login'|'register'|null>(null), [authEmail, setAuthEmail] = useState(''), [authName, setAuthName] = useState(''), [authPassword, setAuthPassword] = useState(''), [authPassword2, setAuthPassword2] = useState('');
  const [hydrated, setHydrated] = useState(false), [saving, setSaving] = useState(false), [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [error, setError] = useState(''), [success, setSuccess] = useState<RequestSuccess|null>(null), [requestKey, setRequestKey] = useState('');
  const [previewUrls, setPreviewUrls] = useState<Record<string,string>>({});
  const loadAccount = useCallback(async () => {
    try { const response = await fetch('/api/account/me', { cache: 'no-store' }); if (!response.ok) { setAccount(null); return; } const body = await response.json(); setAccount(body.user); }
    catch { setAccount(null); }
  }, []);
  const payload = useMemo(() => ({ style, people, base, plinthText, note, contactPreference: preference, phone, fullName, consent, privacyVersion,
    declaredFileKeys: files.map(file => file.key) }), [style, people, base, plinthText, note, preference, phone, fullName, consent, privacyVersion, files]);
  const selectedPackage = packages.find(item => item.id === packageId);
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  const detectedStyle = selectedPackage?.style === 'color' ? 'color' : selectedPackage?.style === 'monochrome' ? 'monochrome' : style;
  const packageMismatch = !!selectedPackage && selectedPackage.style !== 'custom' && (people.filter(x => x.kind === 'person').length !== selectedPackage.characters || people.filter(x => x.kind === 'pet').length !== selectedPackage.pets);
  const persistLocal = useCallback(async (): Promise<boolean> => {
    if (!hydrated || success) return false;
    setSaving(true);
    try { await writeFigurineDraft({ payload: { ...payload, packageId }, files, boundEmail, requestKey, updatedAt: Date.now() }); setError(''); return true; }
    catch { setError('Taslak bu tarayıcıya kaydedilemedi. Sayfadan ayrılmadan önce dosyalarınızı ve metinlerinizi kopyalayın.'); return false; }
    finally { setSaving(false); }
  }, [hydrated, success, payload, packageId, files, boundEmail, requestKey]);
  useEffect(() => {
    let active = true;
    // Hydration applies asynchronous data returned by IndexedDB and the CMS.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    Promise.all([fetch('/api/account/figurine-packages', { cache: 'no-store' }).then(async r => { const v = await r.json(); if (!r.ok) throw new Error('Paket bilgileri şu anda yüklenemiyor; talep gönderimi kapalı.'); return v as { packages?: Package[]; privacyNotice?: string; privacyVersion?: string; priceScopeNote?: string; customerContactNote?: string; limits?: typeof limits; submissionEnabled?: boolean }; }).then(v => { if (!active) return; setPackages(v.packages || []); setPrivacy(v.privacyNotice || ''); setPrivacyVersion(v.privacyVersion || ''); setPriceNote(v.priceScopeNote || ''); setCustomerNote(v.customerContactNote || ''); setSubmissionEnabled(v.submissionEnabled === true); if (v.limits) setLimits(v.limits); }), readFigurineDraft().then(d => { if (!active) return; if (d) { const p = d.payload || {}; setStyle(p.style || 'color'); setPackageId(p.packageId || ''); setPeople(p.people || []); setBase(p.base || ''); setPlinthText(p.plinthText || ''); setNote(p.note || ''); setPreference(p.contactPreference || 'email'); setPhone(p.phone || ''); setFullName(p.fullName || ''); setConsent(Boolean(p.consent)); setFiles(d.files || []); setBoundEmail(d.boundEmail); setRequestKey(d.requestKey || ''); if (!d.boundEmail) setNeedsAccountConfirm(true); } setHydrated(true); }), loadAccount()]).catch(() => { if (active) { setSubmissionEnabled(false); setError('Paket veya form bilgileri yüklenemedi. Talep gönderimi şu anda kapalı; daha sonra tekrar deneyin.'); setHydrated(true); } });
    window.addEventListener('customer-session-changed', loadAccount);
    return () => { active = false; window.removeEventListener('customer-session-changed', loadAccount); };
  }, [loadAccount]);
  useEffect(() => { if (!hydrated || success) return; const timer = window.setTimeout(() => void persistLocal(), 350); return () => window.clearTimeout(timer); }, [persistLocal, hydrated, success]);
  useEffect(() => { if (!hydrated) return; void readFigurineDraft().then(d => { if (d?.requestKey) setRequestKey(d.requestKey); }).catch(() => setError('Yerel taslak okunamadı.')); }, [hydrated]);
  useEffect(() => {
    const next: Record<string,string> = {};
    for (const f of files) next[f.key] = URL.createObjectURL(f.blob);
    // Object URLs are external browser resources whose map mirrors the current File set.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviewUrls(next);
    return () => Object.values(next).forEach(URL.revokeObjectURL);
  }, [files]);
  useEffect(() => { if (account && boundEmail && account.email.toLowerCase() !== boundEmail.toLowerCase()) { const timer = window.setTimeout(() => setNeedsAccountConfirm(true), 0); return () => window.clearTimeout(timer); } }, [account, boundEmail]);
  function updatePerson(id: string, updates: Partial<Person>) { setPeople(current => current.map(item => item.id === id ? { ...item, ...updates } : item)); }
  async function chooseFiles(person: Person, list: FileList|null) {
    if (!list) return;
    const added = Array.from(list);
    if (person.fileKeys.length + added.length > 3) { setError('Her kişi veya pet için en fazla 3 referans fotoğrafı seçebilirsiniz.'); return; }
    if (files.length + added.length > limits.files) { setError(`Bu talebe en fazla ${limits.files} fotoğraf eklenebilir.`); return; }
    if (totalBytes + added.reduce((n,f) => n + f.size,0) > limits.totalBytes) { setError(`Fotoğrafların toplam boyutu ${Math.round(limits.totalBytes/1024/1024)} MB sınırını aşıyor.`); return; }
    if (added.some(f => f.size > limits.fileBytes)) { setError(`Her fotoğraf en fazla ${Math.round(limits.fileBytes/1024/1024)} MB olabilir.`); return; }
    if (added.some(f => !['image/jpeg','image/png','image/webp'].includes(f.type))) { setError('JPEG, PNG veya WebP seçin. HEIC dosyaları doğrulanmıyor; JPEG/PNG alternatifi kullanın.'); return; }
    const newFiles = added.map(file => ({ key: crypto.randomUUID(), name: file.name, type: file.type, size: file.size, blob: file }));
    const nextFiles = [...files, ...newFiles];
    const nextPeople = people.map(item => item.id === person.id ? { ...item, fileKeys: [...item.fileKeys, ...newFiles.map(f => f.key)] } : item);
    setFiles(nextFiles); setPeople(nextPeople); setError('');
    try {
      await writeFigurineDraft({ payload: { ...payload, packageId, people: nextPeople, declaredFileKeys: nextFiles.map(file => file.key) }, files: nextFiles, boundEmail, requestKey, updatedAt: Date.now() });
    } catch {
      setError('Fotoğraf seçildi, ancak bu tarayıcı taslağına hemen kaydedilemedi. Sayfadan ayrılmadan önce tekrar deneyin.');
    }
  }
  function removeFile(person: Person, key: string) { setFiles(current => current.filter(f => f.key !== key)); updatePerson(person.id, { fileKeys: person.fileKeys.filter(x => x !== key) }); }
  function addPerson(kind: 'person'|'pet') { if (people.length >= 10) { setError('Talep başına en fazla 10 kişi/pet eklenebilir.'); return; } setPeople(current => [...current, freshPerson(kind)]); }
  function removePerson(person: Person) { setPeople(current => current.filter(x => x.id !== person.id)); setFiles(current => current.filter(file => !person.fileKeys.includes(file.key))); }
  async function loginOrRegister(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      if (authMode === 'register') {
        if (authPassword !== authPassword2) throw new Error('Şifreler eşleşmiyor.');
        const result = await accountRequest('register', { email: authEmail, password: authPassword, fullName: authName });
        setMessage(`${result.message} E-postadaki doğrulama bağlantısını kullandıktan sonra bu sayfaya dönüp giriş yapın.`); setAuthMode('login');
      } else {
        await accountRequest('login', { email: authEmail, password: authPassword }); window.dispatchEvent(new Event('customer-session-changed')); await loadAccount(); setAuthMode(null); setAuthPassword('');
        if (!boundEmail) setNeedsAccountConfirm(true);
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Üyelik işlemi tamamlanamadı.'); }
    finally { setBusy(false); }
  }
  async function submitRequest(event: React.FormEvent) {
    event.preventDefault(); setError(''); setMessage('');
    if (!hydrated) return;
    if (!submissionEnabled) { setError('Güvenli fotoğraf depolaması ve bilgilendirme ayarları hazır olmadan talep gönderilemez.'); return; }
    if (!account) { const saved = await persistLocal(); if (!saved) return; setAuthMode('login'); setError('Talebi göndermek için giriş yapın veya hesap oluşturup e-postanızı doğrulayın. Form ve seçili dosyalar bu tarayıcıda korundu.'); return; }
    if (needsAccountConfirm) { setError('Taslağı bu hesapla ilişkilendirmek için aşağıdaki onayı verin.'); return; }
    if (!selectedPackage) { setError('Bir paket seçin.'); return; }
    if (packageMismatch) { setError('Paket değişince kişi/pet bilgileri korundu. Paketle eşleşecek sayıyı aşağıdan düzenleyin.'); return; }
    if (selectedPackage.style === 'custom' && (people.filter(x=>x.kind==='person').length<1 || people.filter(x=>x.kind==='person').length>6 || people.filter(x=>x.kind==='pet').length>6)) { setError('Özel talepte 1–6 kişi ve 0–6 pet seçin.'); return; }
    if (people.some(p => p.fileKeys.length === 0)) { setError('Her kişi ve pet için en az bir referans fotoğrafı ekleyin.'); return; }
    if (preference === 'whatsapp' && !phone.trim()) { setError('WhatsApp ile iletişim için telefon numarası gereklidir.'); return; }
    if (!privacy.trim() || !privacyVersion) { setError('Talep ve fotoğraf bilgilendirmesi yayınlanmadan talep gönderilemez.'); return; }
    if (!consent) { setError('Talep göndermek için bilgilendirmeyi onaylamanız gerekir.'); return; }
    setBusy(true);
    try {
      const nextPayload = { ...payload, style: detectedStyle, fullName: fullName || account.fullName, phone: preference === 'whatsapp' ? phone : '', privacyVersion, consent: true, declaredFileKeys: files.map(f=>f.key) };
      await accountRequest('figurine-draft', { packageId, payload: nextPayload });
      for (const file of files) {
        const signed = await accountRequest('figurine-upload-sign', { fileKey: file.key, name: file.name, mime: file.type, size: file.size });
        if (signed.alreadyUploaded) continue;
        const uploaded = await fetch(signed.uploadUrl, { method: signed.method, headers: signed.headers, body: file.blob, mode: 'cors', cache: 'no-store' });
        if (!uploaded.ok) throw new Error(`“${file.name}” yüklenemedi. Bağlantıyı kontrol edip yeniden deneyin.`);
        await accountRequest('figurine-upload-complete', { uploadSessionId: signed.uploadSessionId });
      }
      const stableRequestKey = requestKey || crypto.randomUUID();
      if (!requestKey) { setRequestKey(stableRequestKey); await writeFigurineDraft({ payload: { ...nextPayload, packageId }, files, boundEmail: account.email, requestKey: stableRequestKey, updatedAt: Date.now() }); }
      const result = await accountRequest('figurine-submit', { requestKey: stableRequestKey, packageId, payload: nextPayload }) as RequestSuccess;
      try { await clearFigurineDraft(); setFiles([]); setPeople([]); setNote(''); setPlinthText(''); setConsent(false); }
      catch { setError('Talebiniz kaydedildi, ancak bu cihazdaki taslak temizlenemedi. Tarayıcı depolamasından taslağı kaldırın.'); }
      setSuccess(result);
    } catch (e) { setError(e instanceof Error ? e.message : 'Talebiniz kaydedilemedi. Taslağınız ve seçili dosyalarınız bu tarayıcıda korunuyor; tekrar deneyin.'); }
    finally { setBusy(false); }
  }
  if (success) return <section className={`${card} mx-auto max-w-3xl`} role="status"><div className="text-sm font-bold uppercase tracking-wide text-emerald-700">Talep kaydedildi</div><h2 className="mt-2 text-2xl font-black">Talep numarası: {success.requestNumber}</h2><p className="mt-4 leading-7 text-slate-600">{success.message}</p>{error&&<p role="alert" className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{error}</p>}<div className="mt-6 flex flex-wrap gap-3"><Link className="rounded-xl bg-[#7C3AED] px-5 py-3 font-bold text-white" href={`/hesap/figur-talepleri/${success.requestId}`}>Talep detayına git</Link><a className="rounded-xl border border-emerald-200 px-5 py-3 font-bold text-emerald-800" href={`https://wa.me/905465868005?text=${encodeURIComponent(`Kişiye Özel Figür talebim ${success.requestNumber}.`)}`} target="_blank" rel="noreferrer">WhatsApp&apos;ta görüş</a></div></section>;
  return <div className="mx-auto grid max-w-6xl gap-7 px-4 py-8 text-slate-900 sm:px-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:py-12">
    <div className="space-y-7">
      <header><p className="text-sm font-bold uppercase tracking-[.18em] text-[#7C3AED]">Kişiye Özel Figür</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Aklınızdaki karakteri anlatın</h1><p className="mt-4 max-w-3xl leading-7 text-slate-600">Referans fotoğraflarınızı ve tercihlerinizi iletin. Bu sayfadaki paket fiyatları başlangıç fiyatıdır; kesin sipariş tutarı değildir.</p><p className="mt-2 font-semibold text-slate-700">Funko tarzı standart figür boyutlarında.</p><p className="mt-2 text-sm leading-6 text-slate-600">Üretim, teslimat ve diğer ayrıntılar talebinizden sonra WhatsApp veya e-posta üzerinden netleştirilecek. Bu ürün resmî bir Funko ürünü veya marka ortaklığı olarak sunulmamaktadır.</p></header>
      {packages.some(x => x.gallery.length) && <section className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label="Paket görselleri">{packages.flatMap(p => p.gallery.map((image,i) => <img key={`${p.id}-${i}`} src={image.url} alt={image.alt} className="aspect-square w-full rounded-xl border border-slate-200 object-cover" />))}</section>}
      <form onSubmit={submitRequest} className="space-y-7">
        <section className={card}><h2 className="text-xl font-bold">1. Paket ve renk tercihi</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{(['color','monochrome'] as const).map(item => <label key={item} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${style===item?'border-[#7C3AED] bg-purple-50':'border-slate-200'}`}><input type="radio" name="style" checked={style===item} onChange={()=>setStyle(item)} /><span className="font-semibold">{item==='color'?'Renkli':'Beyaz / tek renk'}</span></label>)}</div>
          <div className="mt-4 grid gap-3">{packages.filter(p => p.style==='custom'||p.style===style).map(p => <label key={p.id} className={`block cursor-pointer rounded-xl border p-4 ${packageId===p.id?'border-[#7C3AED] bg-purple-50':'border-slate-200'}`}><span className="flex flex-wrap items-center justify-between gap-2"><span className="font-bold">{p.title}</span><span className="font-bold text-[#7C3AED]">{p.priceLabel}{p.priceKind==='starting'?' başlangıç':''}</span></span>{p.description&&<span className="mt-1 block text-sm text-slate-600">{p.description}</span>}<input className="sr-only" type="radio" name="package" value={p.id} checked={packageId===p.id} onChange={()=>setPackageId(p.id)} /></label>)}</div>
          <p className="mt-4 text-sm leading-6 text-slate-600">{priceNote || 'Gösterilen fiyat başlangıç fiyatıdır; kesin sipariş tutarı değildir. KDV ve kargo kapsamı talep sonrasında netleştirilecektir.'}</p>{selectedPackage?.style==='custom'&&<p className="mt-2 text-sm text-slate-600">Özel talepte kişi/pet adetlerini aşağıda belirtin. Burada fiyat hesaplanmaz.</p>}
        </section>
        <section className={card}><h2 className="text-xl font-bold">2. Kişi ve pet bilgileri</h2><p className="mt-2 text-sm text-slate-600">Her kişi veya pet için ayrı bir kayıt ve en az bir referans fotoğrafı gerekir. Paket değiştirince mevcut bilgiler silinmez.</p>{packageMismatch&&<p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900" role="status">Paket adediyle formdaki kişi/pet sayısı farklı. Bilgileriniz korunuyor; sayıyı aşağıdan düzenleyin.</p>}
          <div className="mt-4 space-y-5">{people.map((person,index)=><fieldset key={person.id} className="rounded-xl border border-slate-200 p-4"><legend className="px-2 font-bold">{person.kind==='person'?'Kişi':'Pet'} {index+1}</legend><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Tür<select className={input} value={person.kind} onChange={e=>{const kind=e.target.value;if(kind==='person'||kind==='pet')updatePerson(person.id,{kind});}}><option value="person">İnsan</option><option value="pet">Pet</option></select></label><label className="text-sm font-semibold">Kısa açıklama<textarea className={input} rows={2} maxLength={600} value={person.description} onChange={e=>updatePerson(person.id,{description:e.target.value})} placeholder="Kişi/pet hakkında ek bilgi" /></label>
            {person.kind==='person'?<><label className="text-sm font-semibold">Kıyafet<input className={input} maxLength={300} value={person.outfit||''} onChange={e=>updatePerson(person.id,{outfit:e.target.value})} /></label><label className="text-sm font-semibold">Saç<input className={input} maxLength={300} value={person.hair||''} onChange={e=>updatePerson(person.id,{hair:e.target.value})} /></label><label className="text-sm font-semibold">Poz<input className={input} maxLength={300} value={person.pose} onChange={e=>updatePerson(person.id,{pose:e.target.value})} /></label><label className="text-sm font-semibold">Aksesuar tercihleri<input className={input} maxLength={500} value={person.accessories||''} onChange={e=>updatePerson(person.id,{accessories:e.target.value})} /></label></>:<><label className="text-sm font-semibold">Görünüm<input className={input} maxLength={400} value={person.appearance||''} onChange={e=>updatePerson(person.id,{appearance:e.target.value})} /></label><label className="text-sm font-semibold">Belirgin özellikler<input className={input} maxLength={400} value={person.distinctiveFeatures||''} onChange={e=>updatePerson(person.id,{distinctiveFeatures:e.target.value})} /></label><label className="text-sm font-semibold">Poz<input className={input} maxLength={300} value={person.pose} onChange={e=>updatePerson(person.id,{pose:e.target.value})} /></label></>}
          </div><label className="mt-4 block text-sm font-semibold">Referans fotoğrafları<input className={input} type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp,.heic,.heif" multiple onChange={e=>void chooseFiles(person,e.currentTarget.files)} /><span className="mt-1 block font-normal text-slate-500">JPEG, PNG veya WebP. HEIC doğrulanmıyor; JPEG/PNG kullanın. Her dosya en fazla {Math.round(limits.fileBytes/1024/1024)} MB.</span></label><div className="mt-3 flex flex-wrap gap-3">{person.fileKeys.map(key=>{const f=files.find(x=>x.key===key);return f?<figure key={key} className="w-28"><img src={previewUrls[key]} alt={`Seçilen referans: ${f.name}`} className="h-24 w-28 rounded-lg bg-slate-100 object-cover"/><figcaption className="mt-1 truncate text-xs">{f.name}</figcaption><button type="button" className="mt-1 text-xs font-bold text-red-700" onClick={()=>removeFile(person,key)}>Kaldır</button></figure>:null;})}</div><button type="button" className="mt-4 text-sm font-bold text-red-700" onClick={()=>removePerson(person)}>Bu kişi/peti kaldır</button></fieldset>)}</div>
          <div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={()=>addPerson('person')} className="min-h-11 rounded-xl border border-purple-200 px-4 font-semibold text-[#7C3AED]">+ Kişi ekle</button><button type="button" onClick={()=>addPerson('pet')} className="min-h-11 rounded-xl border border-purple-200 px-4 font-semibold text-[#7C3AED]">+ Pet ekle</button></div><p className="mt-3 text-xs text-slate-500">Talep başına en fazla {limits.files} fotoğraf / {Math.round(limits.totalBytes/1024/1024)} MB. Şu an {files.length} dosya, {Math.ceil(totalBytes/1024)} KB.</p>
        </section>
        <section className={card}><h2 className="text-xl font-bold">3. Diğer tercihler ve iletişim</h2><label className="mt-4 block text-sm font-semibold">Kaide yazısı (isteğe bağlı)<input className={input} maxLength={100} value={plinthText} onChange={e=>setPlinthText(e.target.value)} placeholder="Yazılmasını istediğiniz kısa metin" /></label><p className="mt-1 text-xs text-slate-500">Bu alan kaidenin fiyata dahil olduğu anlamına gelmez.</p><label className="mt-4 block text-sm font-semibold">Ek not<textarea className={input} rows={4} maxLength={2000} value={note} onChange={e=>setNote(e.target.value)} placeholder="Talebinizle ilgili eklemek istedikleriniz" /></label>
          <label className="mt-4 block text-sm font-semibold">Ad soyad<input className={input} maxLength={100} required value={fullName} onChange={e=>setFullName(e.target.value)} /></label><div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm"><strong>Hesap e-postası:</strong> {account?.email || 'Giriş yaptıktan sonra hesabınızdaki doğrulanmış e-posta kullanılır.'}</div><fieldset className="mt-4"><legend className="font-semibold">İletişim tercihi</legend><label className="mt-3 flex min-h-11 items-center gap-3"><input type="radio" name="contact" checked={preference==='email'} onChange={()=>setPreference('email')} />E-posta</label><label className="mt-2 flex min-h-11 items-center gap-3"><input type="radio" name="contact" checked={preference==='whatsapp'} onChange={()=>setPreference('whatsapp')} />WhatsApp</label></fieldset>{preference==='whatsapp'&&<label className="mt-3 block text-sm font-semibold">Telefon numarası<input className={input} type="tel" autoComplete="tel" required value={phone} onChange={e=>setPhone(e.target.value)} /></label>}
          <label className="mt-4 block text-sm font-semibold">Renk tercihi<select className={input} value={style} onChange={e=>{const nextStyle=e.target.value;if(nextStyle==='color'||nextStyle==='monochrome')setStyle(nextStyle);}}><option value="color">Renkli</option><option value="monochrome">Beyaz / tek renk</option></select></label>
          <div className="mt-5 rounded-xl border border-slate-200 p-4"><h3 className="font-bold">Talep ve fotoğraf bilgilendirmesi</h3>{privacy.trim()?<><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{privacy}</p><label className="mt-4 flex items-start gap-3 text-sm"><input className="mt-1" type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} /><span>Yukarıdaki bilgilendirmeyi okudum.</span></label></>:<p className="mt-2 text-sm text-amber-800">Bilgilendirme metni yönetim panelinde henüz yayınlanmadı; talep gönderimi geçici olarak kapalı.</p>}</div>
        </section>
        {error&&<p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}{message&&<p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{message}</p>}
        {needsAccountConfirm&&account&&<section className="rounded-xl border border-amber-300 bg-amber-50 p-4"><p className="font-semibold">Bu tarayıcıdaki taslağı {account.email} hesabıyla ilişkilendirmek istiyor musunuz?</p><p className="mt-1 text-sm">Taslak ve fotoğraflar bu hesaba bağlanacak. Onay vermeden gönderim yapılmaz.</p><button type="button" className="mt-3 rounded-lg bg-amber-800 px-4 py-2 font-bold text-white" onClick={()=>{setBoundEmail(account.email);setNeedsAccountConfirm(false);}}>Taslağı bu hesapla devam ettir</button></section>}
        {!account&&authMode&&<section className={card}><h2 className="text-xl font-bold">{authMode==='login'?'Hesabınıza giriş yapın':'Hesap oluşturun'}</h2><div className="mt-3 flex gap-4 text-sm font-semibold"><button type="button" onClick={()=>setAuthMode('login')} className={authMode==='login'?'text-[#7C3AED]':'text-slate-500'}>Giriş</button><button type="button" onClick={()=>setAuthMode('register')} className={authMode==='register'?'text-[#7C3AED]':'text-slate-500'}>Kayıt</button></div><form className="mt-4 space-y-4" onSubmit={loginOrRegister}>{authMode==='register'&&<label className="block text-sm font-semibold">Ad soyad<input className={input} required maxLength={100} value={authName} onChange={e=>setAuthName(e.target.value)} /></label>}<label className="block text-sm font-semibold">E-posta<input className={input} type="email" autoComplete="email" required value={authEmail} onChange={e=>setAuthEmail(e.target.value)} /></label><label className="block text-sm font-semibold">Şifre<input className={input} type="password" autoComplete={authMode==='login'?'current-password':'new-password'} minLength={authMode==='register'?12:undefined} maxLength={72} required value={authPassword} onChange={e=>setAuthPassword(e.target.value)} /></label>{authMode==='register'&&<label className="block text-sm font-semibold">Şifre tekrar<input className={input} type="password" minLength={12} maxLength={72} required value={authPassword2} onChange={e=>setAuthPassword2(e.target.value)} /></label>}<button disabled={busy} className="min-h-12 rounded-xl bg-[#7C3AED] px-5 font-bold text-white disabled:opacity-50">{busy?'İşleniyor…':authMode==='login'?'Giriş yap':'Hesap oluştur'}</button></form><p className="mt-3 text-xs text-slate-500">Kayıt sonrası e-posta doğrulanmalıdır. Taslak ve File içerikleri IndexedDB içinde korunur; kaydetme başarısız olursa hata gösterilir.</p><div className="mt-3 flex flex-wrap gap-4 text-sm"><Link className="font-semibold text-[#7C3AED]" href="/hesap/sifremi-unuttum">Şifremi unuttum</Link><Link className="font-semibold text-[#7C3AED]" href="/hesap/dogrulama-gonder">Doğrulama e-postası</Link></div></section>}
        <button disabled={busy||saving||packageMismatch||!submissionEnabled} className="min-h-14 w-full rounded-xl bg-[#7C3AED] px-6 py-4 text-lg font-black text-white shadow-lg shadow-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50">{busy?'Talep gönderiliyor…':'Talep Gönder'}</button>{!submissionEnabled&&<p className="text-center text-sm text-amber-800">Paket, gizlilik bilgilendirmesi ve özel fotoğraf altyapısı hazır olana kadar bu sayfayı inceleyebilirsiniz; talep gönderimi kapalıdır.</p>}<p className="text-center text-xs text-slate-500">{saving?'Taslak kaydediliyor…':hydrated?'Taslak bu tarayıcıda korunuyor.':'Taslak deposu açılıyor…'}</p>
      </form>
    </div>
    <aside className="h-fit space-y-4 lg:sticky lg:top-28"><div className={card}><h2 className="font-bold">Talep özeti</h2><p className="mt-3 text-sm text-slate-600">{selectedPackage?.title||'Henüz paket seçilmedi'}</p><p className="mt-2 text-sm font-bold text-[#7C3AED]">{selectedPackage?.priceLabel||'—'}{selectedPackage?.priceKind==='starting'?' başlangıç fiyatı':''}</p><p className="mt-3 text-xs leading-5 text-slate-500">{priceNote || 'Kesin tutar ile KDV/kargo kapsamı talep sonrası netleştirilecek.'}</p><p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">{people.filter(p=>p.kind==='person').length} kişi · {people.filter(p=>p.kind==='pet').length} pet</p><p className="mt-1 text-sm text-slate-600">{files.length} referans fotoğrafı</p><p className="mt-4 text-xs leading-5 text-slate-500">{customerNote || 'Üretim, teslimat ve diğer ayrıntılar talep sonrasında WhatsApp veya e-posta ile netleştirilir.'}</p></div><Link href="/hesap" className="block min-h-11 rounded-xl border border-purple-200 bg-white px-4 py-3 text-center text-sm font-bold text-[#7C3AED]">Hesabım</Link></aside>
  </div>;
}
