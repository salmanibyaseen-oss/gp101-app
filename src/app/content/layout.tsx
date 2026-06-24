// src/app/content/layout.tsx
export const dynamic = 'force-dynamic';
import { Sidebar } from "@/components/Sidebar";
import { OnlineStatus } from "@/components/OnlineStatus";
import { LogoutButton } from "@/components/LogoutButton";
import { content } from "@/lib/content";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  let user = null;
  if (token) {
    try {
      user = verifyToken(token);
    } catch {}
  }
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar sections={content.sections} isAdmin={user?.isAdmin} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <OnlineStatus />
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block">
              👨‍⚕️ {user?.email?.split("@")[0] || ""}
            </span>
            {user?.isAdmin && (
              <a href="/admin" className="text-xs bg-[#1e3a5f] text-white px-3 py-1.5 rounded-lg">
                لوحة التحكم
              </a>
            )}
            <LogoutButton />
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
