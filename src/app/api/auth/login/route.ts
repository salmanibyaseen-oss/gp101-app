// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signToken, MAX_DEVICES } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const { email, password, fingerprint, userAgent } = await req.json();

    if (!email || !password || !fingerprint) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "البريد الإلكتروني أو كلمة المرور غلط" }, { status: 401 });
    }

    // Check active
    if (!user.isActive) {
      return NextResponse.json({ error: "الحساب موقوف. تواصل مع الإدارة" }, { status: 403 });
    }

    // Check expiry
    if (user.expiresAt && new Date() > user.expiresAt) {
      return NextResponse.json({ error: "انتهت صلاحية الاشتراك" }, { status: 403 });
    }

    // Check password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "البريد الإلكتروني أو كلمة المرور غلط" }, { status: 401 });
    }

    // Handle device
    let device = await prisma.device.findUnique({
      where: { userId_fingerprint: { userId: user.id, fingerprint } },
    });

    if (!device) {
      // Count existing devices
      const deviceCount = await prisma.device.count({ where: { userId: user.id } });

      if (deviceCount >= MAX_DEVICES) {
        return NextResponse.json(
          {
            error: `وصلت للحد الأقصى من الأجهزة (${MAX_DEVICES} أجهزة). تواصل مع الإدارة لإعادة التعيين`,
          },
          { status: 403 }
        );
      }

      // Register new device
      device = await prisma.device.create({
        data: {
          userId: user.id,
          fingerprint,
          userAgent: userAgent || "Unknown",
          label: `جهاز ${deviceCount + 1}`,
        },
      });
    } else {
      // Update last seen
      await prisma.device.update({
        where: { id: device.id },
        data: { lastSeen: new Date() },
      });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Create token
    const token = signToken({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      deviceId: device.id,
    });

    const response = NextResponse.json({
      success: true,
      user: { name: user.name, email: user.email, isAdmin: user.isAdmin },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "حدث خطأ في السيرفر" }, { status: 500 });
  }
}
