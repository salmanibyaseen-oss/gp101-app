import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.redirect(
    new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "https://gp101app.vercel.app")
  );
  response.cookies.delete("auth_token");
  return response;
}
