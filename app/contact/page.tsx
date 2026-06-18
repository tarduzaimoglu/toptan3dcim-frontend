"use client";

import { useState } from "react";
import { Mail, MapPin, Phone, MessageCircle, Send, CheckCircle2, XCircle } from "lucide-react";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    
    // Form verilerini otomatik olarak topla
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus("success");
        (e.target as HTMLFormElement).reset(); // Formu başarıyla gönderdikten sonra temizle
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
    
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 py-16">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        {/* Başlık */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-4">Bize Ulaşın</h1>
          <p className="text-slate-600 max-w-xl">
            Projeniz mi var? 3D baskı, endüstriyel tasarım veya toptan üretim ihtiyaçlarınız için formu doldurun veya doğrudan bizimle iletişime geçin.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* 1. Mesaj Gönderme Formu */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Mesaj Gönderin</h2>
            
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-5">
                <input 
                  name="name" 
                  type="text" 
                  required 
                  placeholder="Adınız Soyadınız" 
                  className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#7C3AED] outline-none transition-all" 
                />
                <input 
                  name="email" 
                  type="email" 
                  required 
                  placeholder="E-posta Adresiniz" 
                  className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#7C3AED] outline-none transition-all" 
                />
              </div>
              <input 
                name="subject" 
                type="text" 
                required 
                placeholder="Konu" 
                className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#7C3AED] outline-none transition-all" 
              />
              <textarea 
                name="message" 
                required 
                placeholder="Projenizden kısaca bahsedin..." 
                rows={4} 
                className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#7C3AED] outline-none transition-all resize-y" 
              />
              
              {/* Bildirim Mesajları (Başarılı / Hatalı) */}
              {status === "success" && (
                <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl flex items-center gap-3 font-medium border border-emerald-100">
                  <CheckCircle2 size={24} className="text-emerald-500 shrink-0" />
                  Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız!
                </div>
              )}
              {status === "error" && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 font-medium border border-red-100">
                  <XCircle size={24} className="text-red-500 shrink-0" />
                  Mesaj gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin veya WhatsApp'tan yazın.
                </div>
              )}

              <button 
                type="submit"
                disabled={loading} 
                className="w-full md:w-auto px-8 py-4 bg-[#7C3AED] text-white font-bold rounded-xl hover:bg-[#6b1add] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Gönderiliyor..." : (
                  <>Mesajı Gönder <Send size={18} /></>
                )}
              </button>
            </form>
          </div>

          {/* 2. İletişim Bilgileri & Harita */}
          <div className="space-y-6">
            <div className="bg-[#7C3AED] text-white p-8 rounded-3xl shadow-xl shadow-[#7C3AED]/20">
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <MapPin className="shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold mb-1">Adres</h3>
                    <p className="text-white/80">Acıbadem Mahallesi, Akçaağaç Sokak No: 8<br/>Üsküdar / İSTANBUL</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="shrink-0" />
                  <div>
                    <h3 className="font-bold mb-1">Telefon</h3>
                    <p className="text-white/80">+90 (546) 586 80 05</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Mail className="shrink-0" />
                  <div>
                    <h3 className="font-bold mb-1">E-Posta</h3>
                    <p className="text-white/80">info@kesiolabs.com</p>
                  </div>
                </div>
                
                {/* WhatsApp Yönlendirme Butonu */}
                <a 
                  href="https://wa.me/905465868005" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#7C3AED] font-bold rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <MessageCircle size={18} /> WhatsApp'tan Yazın
                </a>
              </div>
            </div>

            {/* Harita */}
            <div className="h-64 w-full rounded-3xl overflow-hidden border border-slate-200 bg-slate-200">
               <iframe 
                 src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3011.666998970477!2d29.04359537671158!3d41.00392397135111!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab84c16b1e105%3A0x6b09337537b01b2c!2sAk%C3%A7aa%C4%9Fa%C3%A7%20Sk.%20No%3A8%2C%2034718%20%C3%9Csk%C3%BCdar%2F%C4%B0stanbul!5e0!3m2!1str!2str!4v1716300000000" 
                 width="100%" height="100%" style={{border:0}} allowFullScreen loading="lazy">
               </iframe>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
