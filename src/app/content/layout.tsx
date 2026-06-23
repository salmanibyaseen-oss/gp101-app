// src/app/content/layout.tsx
export const dynamic = 'force-dynamic';
import { Sidebar } from "@/components/Sidebar";
import { OnlineStatus } from "@/components/OnlineStatus";
import { content } from "@/lib/content";
import { getCurrentUser } from "@/lib/auth";

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar sections={content.sections} isAdmin={user?.isAdmin} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <OnlineStatus />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block">
              👨‍⚕️ مرحباً، {user?.email?.split("@")[0]}
            </span>
            {user?.isAdmin && (
              <a
                href="/admin"
                className="text-xs bg-[#1e3a5f] text-white px-3 py-1.5 rounded-lg hover:bg-[#2d5a9e]"
              >
                لوحة التحكم
              </a>
            )}
            <LogoutButton />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="POST">
      <button
        type="submit"
        className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-100"
        formAction="/api/auth/logout"
      >
        خروج
      </button>
    </form>
  );
}
