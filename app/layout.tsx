import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget"; // ✅ WhatsApp baloncuğunu import ettik
import { CartProvider } from "@/components/cart/CartContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TOPTAN3DCİM | 3D Baskı ve Çözümleri",
  description: "KesioLabs güvencesiyle kaliteli ve hızlı toptan 3D baskı hizmetleri",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            {/* Navigasyon menüsü her sayfada en üstte */}
            <Header />
            
            {/* İçerik az olsa bile footer'ın en altta kalmasını sağlayan yapı */}
            <main className="flex-grow">
              {children}
            </main>
            
            {/* Alt bilgi alanı her sayfada en altta */}
            <Footer />

            {/* ✅ Canlı destek baloncuğu her sayfanın sağ alt köşesinde */}
            <WhatsAppWidget />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}