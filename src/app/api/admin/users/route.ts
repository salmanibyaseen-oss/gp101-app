// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

function requireAdmin() {
  const user = getCurrentUser();
  if (!user?.isAdmin) return null;
  return user;
}

// GET all users
export async function GET() {
  if (!requireAdmin()) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const users = await prisma.user.findMany({
    where: { isAdmin: false },
    select: {
      id: true,
      email: true,
      name: true,
      isActive: true,
      expiresAt: true,
      createdAt: true,
      lastLogin: true,
      devices: { select: { id: true, label: true, userAgent: true, lastSeen: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}

// POST create user
export async function POST(req: NextRequest) {
  if (!requireAdmin()) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { email, name, password, expiresAt } = await req.json();
  if (!email || !name || !password) {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "البريد الإلكتروني موجود بالفعل" }, { status: 400 });

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashed,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  return NextResponse.json({ success: true, userId: user.id });
}

// PATCH update user (toggle active, reset devices, update expiry)
export async function PATCH(req: NextRequest) {
  if (!requireAdmin()) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { userId, action, value } = await req.json();

  if (action === "toggleActive") {
    await prisma.user.update({ where: { id: userId }, data: { isActive: value } });
  } else if (action === "resetDevices") {
    await prisma.device.deleteMany({ where: { userId } });
  } else if (action === "updateExpiry") {
    await prisma.user.update({
      where: { id: userId },
      data: { expiresAt: value ? new Date(value) : null },
    });
  } else if (action === "resetPassword") {
    const hashed = await bcrypt.hash(value, 12);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  }

  return NextResponse.json({ success: true });
}

// DELETE user
export async function DELETE(req: NextRequest) {
  if (!requireAdmin()) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId مطلوب" }, { status: 400 });

  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ success: true });
}
