"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, Package, Palette, Settings, UserRound } from "lucide-react";

const items = [
  { href: "/hesap", label: "Genel bakış", icon: Home, exact: true },
  { href: "/hesap/profil", label: "Profil", icon: UserRound },
  { href: "/hesap/adresler", label: "Adreslerim", icon: MapPin },
  { href: "/hesap/siparisler", label: "Siparişlerim", icon: Package },
  { href: "/hesap/figur-talepleri", label: "Figür taleplerim", icon: Palette },
  { href: "/hesap/tercihler", label: "Tercihler ve veri", icon: Settings },
];

export default function AccountNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Hesap menüsü" className="account-nav">
      {items.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`account-nav-link ${active ? "account-nav-link-active" : ""}`}>
            <Icon aria-hidden="true" size={18} strokeWidth={2} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
