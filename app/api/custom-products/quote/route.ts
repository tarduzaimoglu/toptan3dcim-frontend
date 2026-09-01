import nodemailer from "nodemailer";
import { ALLOWED_LOGO_FILES, MAX_LOGO_FILE_BYTES } from "@/lib/custom-products/constants";
import { getCustomProductTypes } from "@/lib/strapi";

export const runtime = "nodejs";

const MAX_REQUEST_BYTES = MAX_LOGO_FILE_BYTES + 256 * 1024;
const FIELD_LIMITS = { name: 100, company: 120, phone: 30, email: 160, note: 2000, selectedTypes: 500 } as const;

function cleanField(formData: FormData, key: keyof typeof FIELD_LIMITS) {
  return String(formData.get(key) || "").trim().slice(0, FIELD_LIMITS[key]);
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function safeFilename(value: string) {
  return value.split(/[\\/]/).pop()?.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "logo";
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_REQUEST_BYTES) return Response.json({ ok: false, message: "Dosya boyutu sınırı aşıldı." }, { status: 413 });

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return Response.json({ ok: false, message: "Geçerli form verisi gönderin." }, { status: 400 });
    }
    if (String(formData.get("website") || "")) return Response.json({ ok: true });

    const name = cleanField(formData, "name");
    const company = cleanField(formData, "company");
    const phone = cleanField(formData, "phone");
    const email = cleanField(formData, "email").toLowerCase();
    const note = cleanField(formData, "note");
    const selectedTypes = cleanField(formData, "selectedTypes");
    const accepted = formData.get("accepted") === "true";
    const logo = formData.get("logo");

    if (!name || !company || phone.length < 7 || !/^\S+@\S+\.\S+$/.test(email) || !selectedTypes || !accepted) {
      return Response.json({ ok: false, message: "Zorunlu alanları kontrol edin." }, { status: 400 });
    }

    const allowedTitles = new Set((await getCustomProductTypes()).map((type) => type.title));
    const requestedTitles = selectedTypes.split(",").map((item) => item.trim()).filter(Boolean);
    if (!requestedTitles.length || requestedTitles.some((title) => !allowedTitles.has(title))) {
      return Response.json({ ok: false, message: "Geçersiz ürün seçimi." }, { status: 400 });
    }

    const attachments: { filename: string; content: Buffer; contentType: string }[] = [];
    if (logo instanceof File && logo.size > 0) {
      const extension = logo.name.slice(logo.name.lastIndexOf(".")).toLowerCase();
      const extensions = ALLOWED_LOGO_FILES[logo.type as keyof typeof ALLOWED_LOGO_FILES] as readonly string[] | undefined;
      if (!extensions?.includes(extension) || logo.size > MAX_LOGO_FILE_BYTES) {
        return Response.json({ ok: false, message: "Logo dosyası PNG, JPG veya PDF ve en fazla 6 MB olmalıdır." }, { status: 400 });
      }
      attachments.push({ filename: safeFilename(logo.name), content: Buffer.from(await logo.arrayBuffer()), contentType: logo.type });
    }

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 465);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.MAIL_FROM || process.env.SMTP_FROM || user;
    const to = process.env.MAIL_TO || process.env.CONTACT_TO || user;
    if (!host || !user || !pass) {
      console.error("Custom products mail configuration is incomplete.");
      return Response.json({ ok: false, message: "Teklif servisi henüz yapılandırılmadı." }, { status: 503 });
    }

    const secure = process.env.SMTP_SECURE == null ? port === 465 : process.env.SMTP_SECURE === "true";
    const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
    await transporter.sendMail({
      from,
      to,
      replyTo: email,
      subject: `Toptan3Dcim Özel Ürün Teklif Talebi — ${company}`,
      html: `<h2>Yeni Özel Ürün Teklif Talebi</h2><p><b>Ad Soyad:</b> ${escapeHtml(name)}</p><p><b>Firma:</b> ${escapeHtml(company)}</p><p><b>Telefon:</b> ${escapeHtml(phone)}</p><p><b>E-posta:</b> ${escapeHtml(email)}</p><p><b>Seçilen Ürünler:</b> ${escapeHtml(requestedTitles.join(", "))}</p><p><b>Not:</b><br/>${escapeHtml(note).replaceAll("\n", "<br/>")}</p>`,
      attachments,
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Custom products quote delivery failed:", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ ok: false, message: "Talep gönderilemedi. Lütfen daha sonra tekrar deneyin." }, { status: 500 });
  }
}
