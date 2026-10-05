import Link from "next/link";
import type { ReactNode } from "react";

export const fieldClass = "account-field";
export const primaryButtonClass = "account-button account-button-primary";
export const secondaryButtonClass = "account-button account-button-secondary";

export function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <header className="account-page-heading">
    <div>{eyebrow && <p className="account-eyebrow">{eyebrow}</p>}<h2>{title}</h2>{description && <p>{description}</p>}</div>
    {action && <div className="shrink-0">{action}</div>}
  </header>;
}

export function Notice({ kind = "info", children, role }: { kind?: "info" | "success" | "error" | "warning"; children: ReactNode; role?: "alert" | "status" }) {
  return <div role={role || (kind === "error" ? "alert" : "status")} className={`account-notice account-notice-${kind}`}>{children}</div>;
}

export function EmptyState({ title, description, href, action }: { title: string; description: string; href?: string; action?: string }) {
  return <section className="account-empty"><div aria-hidden="true" className="account-empty-mark">◇</div><h3>{title}</h3><p>{description}</p>{href && action && <Link href={href} className={primaryButtonClass}>{action}</Link>}</section>;
}

export function StatusBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "purple" | "green" | "amber" | "red" }) {
  return <span className={`account-badge account-badge-${tone}`}>{children}</span>;
}

export function DetailRow({ label, value, strong = false }: { label: string; value: ReactNode; strong?: boolean }) {
  return <div className={`account-detail-row ${strong ? "account-detail-row-strong" : ""}`}><dt>{label}</dt><dd>{value}</dd></div>;
}
