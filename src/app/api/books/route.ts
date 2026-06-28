import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // غيّر المسار لو ملف Prisma client بتاعك في مكان تاني

export async function GET() {
  try {
    const books = await prisma.book.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        fileUrl: true,
        coverUrl: true,
        price: true,
      },
    });
    return NextResponse.json({ books });
  } catch (error) {
    return NextResponse.json({ books: [], error: "فشل تحميل الكتب" }, { status: 500 });
  }
}
