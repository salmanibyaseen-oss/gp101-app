import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "غير مسجل دخول" }, { status: 401 });

  const hasAccess = user.hasBooksAccess || user.isAdmin;
  if (!hasAccess) return NextResponse.json({ error: "هذا الكتاب يتطلب اشتراك" }, { status: 403 });

  const book = await prisma.book.findUnique({ where: { id: params.id } });
  if (!book || !book.isActive) return NextResponse.json({ error: "الكتاب غير موجود" }, { status: 404 });

  const { data, error } = await supabase.storage
    .from("Books")
    .createSignedUrl(book.fileUrl, 120); // صالح لدقيقتين فقط

  if (error || !data) return NextResponse.json({ error: "فشل توليد رابط الملف" }, { status: 500 });

  return NextResponse.json({
    url: data.signedUrl,
    title: book.title,
    watermark: `${user.name || user.email} — ${new Date().toLocaleDateString("ar-EG")}`,
  });
}
