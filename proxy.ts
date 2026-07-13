import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_PAYMENTS_ENABLED !== "true") {
    return NextResponse.redirect(new URL("/cart", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/checkout",
};
