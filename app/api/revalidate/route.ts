import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid secret",
      },
      { status: 401 }
    );
  }

  try {
    // Banner fetch cache'ini temizler
    revalidateTag("banners", { expire: 0 });

    // Ana sayfa route cache'ini temizler
    revalidatePath("/");

    return NextResponse.json({
      ok: true,
      message: "Homepage and banners cache revalidated",
      now: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Revalidate error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Revalidation failed",
      },
      { status: 500 }
    );
  }
}