"use client";
// src/app/admin/page.tsx
import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  lastLogin: string | null;
  devices: { id: string; label: string; userAgent: string; lastSeen: string }[];
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  expiredUsers: number;
  recentLogins: { name: string; email: string; lastLogin: string }[];
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeTab, setActiveTab] = useState<"stats" | "users" | "add">("stats");
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  // New user form
  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    password: "",
    expiresAt: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [usersRes, statsRes] = await Promise.all([
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/admin/stats").then((r) => r.json()),
    ]);
    setUsers(usersRes.users || []);
    setStats(statsRes);
    setLoading(false);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });
    const data = await res.json();
    if (res.ok) {
      alert("✅ تم إضافة المستخدم");
      setNewUser({ email: "", name: "", password: "", expiresAt: "" });
      fetchData();
      setActiveTab("users");
    } else {
      alert("❌ " + data.error);
    }
  };

  const handleAction = async (userId: string, action: string, value?: any) => {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action, value }),
    });
    if (res.ok) fetchData();
  };

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`حذف ${email}؟`)) return;
    await fetch(`/api/admin/users?userId=${userId}`, { method: "DELETE" });
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1e3a5f] text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">لوحة تحكم GP101</h1>
          <p className="text-white/60 text-xs">إدارة المشتركين والأجهزة</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/"
            className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg"
          >
            → الموقع
          </a>
          <form method="POST" action="/api/auth/logout">
            <button className="text-sm border border-white/30 hover:bg-white/10 px-3 py-1.5 rounded-lg">
              خروج
            </button>
          </form>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-1">
          {[
            { key: "stats", label: "📊 إحصائيات" },
            { key: "users", label: `👥 المستخدمون (${users.length})` },
            { key: "add", label: "➕ إضافة مستخدم" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-[#0ea5e9] text-[#0ea5e9]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-10 text-gray-500">جاري التحميل...</div>
        ) : (
          <>
            {/* Stats Tab */}
            {activeTab === "stats" && stats && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatCard label="إجمالي المشتركين" value={stats.totalUsers} color="blue" icon="👥" />
                  <StatCard label="مشتركون نشطون" value={stats.activeUsers} color="green" icon="✅" />
                  <StatCard label="منتهي الاشتراك" value={stats.expiredUsers} color="red" icon="⏰" />
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h2 className="font-bold text-gray-800 mb-4">آخر عمليات الدخول</h2>
                  {stats.recentLogins.length === 0 ? (
                    <p className="text-gray-500 text-sm">لا يوجد</p>
                  ) : (
                    <div className="space-y-2">
                      {stats.recentLogins.map((u, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                        >
                          <div>
                            <div className="text-sm font-medium">{u.name}</div>
                            <div className="text-xs text-gray-500">{u.email}</div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(u.lastLogin).toLocaleString("ar-EG")}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="space-y-3">
                {users.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    لا يوجد مستخدمون. أضف مستخدمًا جديدًا!
                  </div>
                ) : (
                  users.map((user) => (
                    <div
                      key={user.id}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                    >
                      <div
                        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50"
                        onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                      >
                        {/* Status indicator */}
                        <div
                          className={`w-3 h-3 rounded-full flex-shrink-0 ${
                            user.isActive && (!user.expiresAt || new Date(user.expiresAt) > new Date())
                              ? "bg-green-500"
                              : "bg-red-400"
                          }`}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>

                        <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500">
                          <span>📱 {user.devices.length}/3 أجهزة</span>
                          {user.expiresAt && (
                            <span>
                              ⏰ {new Date(user.expiresAt).toLocaleDateString("ar-EG")}
                            </span>
                          )}
                          {user.lastLogin && (
                            <span>
                              🕐 {new Date(user.lastLogin).toLocaleDateString("ar-EG")}
                            </span>
                          )}
                        </div>

                        <span className="text-gray-400">{expandedUser === user.id ? "▲" : "▼"}</span>
                      </div>

                      {expandedUser === user.id && (
                        <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-4">
                          {/* Devices */}
                          <div>
                            <div className="text-xs font-semibold text-gray-600 mb-2">
                              الأجهزة المسجلة ({user.devices.length}/3)
                            </div>
                            {user.devices.length === 0 ? (
                              <p className="text-xs text-gray-400">لا أجهزة مسجلة</p>
                            ) : (
                              <div className="space-y-1">
                                {user.devices.map((d) => (
                                  <div
                                    key={d.id}
                                    className="text-xs bg-white rounded border border-gray-200 px-3 py-2"
                                  >
                                    <span className="font-medium">{d.label}</span>
                                    <span className="text-gray-400 mr-2">
                                      • آخر نشاط: {new Date(d.lastSeen).toLocaleDateString("ar-EG")}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleAction(user.id, "toggleActive", !user.isActive)}
                              className={`text-xs px-3 py-1.5 rounded-lg ${
                                user.isActive
                                  ? "bg-red-50 text-red-700 hover:bg-red-100"
                                  : "bg-green-50 text-green-700 hover:bg-green-100"
                              }`}
                            >
                              {user.isActive ? "⏸ إيقاف" : "▶ تفعيل"}
                            </button>

                            <button
                              onClick={() => handleAction(user.id, "resetDevices")}
                              className="text-xs px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100"
                            >
                              📱 مسح الأجهزة
                            </button>

                            <button
                              onClick={() => {
                                const date = prompt("تاريخ انتهاء الاشتراك (YYYY-MM-DD):", "");
                                if (date) handleAction(user.id, "updateExpiry", date);
                              }}
                              className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
                            >
                              ⏰ تجديد
                            </button>

                            <button
                              onClick={() => {
                                const pw = prompt("كلمة المرور الجديدة:");
                                if (pw) handleAction(user.id, "resetPassword", pw);
                              }}
                              className="text-xs px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100"
                            >
                              🔑 كلمة مرور
                            </button>

                            <button
                              onClick={() => handleDelete(user.id, user.email)}
                              className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                            >
                              🗑 حذف
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Add User Tab */}
            {activeTab === "add" && (
              <div className="max-w-md">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="font-bold text-gray-800 mb-5">إضافة مستخدم جديد</h2>
                  <form onSubmit={handleAddUser} className="space-y-4">
                    <Field
                      label="الاسم"
                      value={newUser.name}
                      onChange={(v) => setNewUser({ ...newUser, name: v })}
                      placeholder="د. أحمد محمد"
                    />
                    <Field
                      label="البريد الإلكتروني"
                      type="email"
                      value={newUser.email}
                      onChange={(v) => setNewUser({ ...newUser, email: v })}
                      placeholder="doctor@email.com"
                    />
                    <Field
                      label="كلمة المرور"
                      type="password"
                      value={newUser.password}
                      onChange={(v) => setNewUser({ ...newUser, password: v })}
                      placeholder="••••••••"
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        تاريخ انتهاء الاشتراك (اختياري)
                      </label>
                      <input
                        type="date"
                        value={newUser.expiresAt}
                        onChange={(e) => setNewUser({ ...newUser, expiresAt: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#1e3a5f] text-white py-2.5 rounded-lg font-semibold hover:bg-[#2d5a9e]"
                    >
                      إضافة المستخدم
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: string;
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    red: "bg-red-50 text-red-700 border-red-200",
  } as Record<string, string>;

  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm mt-1 flex items-center gap-1">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
        dir={type === "email" || type === "password" ? "ltr" : "rtl"}
      />
    </div>
  );
}
