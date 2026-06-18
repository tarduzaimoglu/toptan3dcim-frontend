// app/api/contact/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  const { name, email, subject, message } = await req.json();

  const transporter = nodemailer.createTransport({
    service: 'gmail', // Veya kendi SMTP bilgilerin
    auth: {
      user: 'info@kesiolabs.com',
      pass: 'BURAYA_UYGULAMA_SIFRESINI_YAZ', // Gmail için App Password gerekir
    },
  });

  try {
    await transporter.sendMail({
      from: email,
      to: 'info@kesiolabs.com',
      subject: `Yeni Mesaj: ${subject}`,
      text: `Gönderen: ${name} (${email})\n\nMesaj:\n${message}`,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}