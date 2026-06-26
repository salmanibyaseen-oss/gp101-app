"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const SPECIALTIES = [
  { name: "الباطنة", en: "Medicine", icon: "🩺", color: "#c62828", slug: "medicine" },
  { name: "الجراحة", en: "Surgery", icon: "🔪", color: "#1565c0", slug: "surgery" },
  { name: "الأطفال", en: "Pediatrics", icon: "👶", color: "#6a1b9a", slug: "pediatrics" },
  { name: "نساء وتوليد", en: "OB/GYN", icon: "🤰", color: "#00695c", slug: "obgyn" },
  { name: "أنف وأذن", en: "ENT", icon: "👂", color: "#e65100", slug: "ent" },
  { name: "عيون", en: "Ophthalmology", icon: "👁️", color: "#0277bd", slug: "ophthalmology" },
  { name: "جلدية", en: "Dermatology", icon: "🩹", color: "#558b2f", slug: "dermatology" },
  { name: "سموم", en: "Toxicology", icon: "☠️", color: "#4e342e", slug: "toxicology" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showPWA, setShowPWA] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    // Check if service worker already cached content
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setOfflineReady(true);
      });
    }

    // Show PWA tip after 3 seconds if not installed
    const timer = setTimeout(() => {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
      if (!isStandalone) setShowPWA(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/content?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div dir="rtl" style={{
      minHeight: "100vh",
      background: "#f6f9fc",
      fontFamily: "'Segoe UI', Arial, sans-serif",
    }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0B1E3D 0%, #0E7C86 100%)",
        padding: "24px 20px 40px",
        color: "#fff",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 900 }}>
            <span style={{ color: "#F4A723" }}>GP</span>101
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => router.push("/admin")}
              style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}
            >
              لوحة التحكم
            </button>
          </div>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
          مرحباً بك 👋
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 20 }}>
          مرجع الطبيب العام وطبيب الامتياز
        </p>

        {/* Search */}
        <form onSubmit={handleSearch}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن موضوع... مثال: Syncope، ECG، Sepsis"
              style={{
                width: "100%", padding: "14px 48px 14px 16px",
                borderRadius: 14, border: "none",
                fontSize: 14, outline: "none",
                boxSizing: "border-box",
                background: "#fff",
                color: "#0B1E3D",
              }}
            />
            <button type="submit" style={{
              position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
              background: "#0E7C86", border: "none", borderRadius: 8,
              width: 32, height: 32, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 16,
            }}>🔍</button>
          </div>
        </form>
      </div>

      {/* Offline + PWA tips */}
      <div style={{ padding: "0 16px", marginTop: -16 }}>

        {/* Offline status */}
        <div style={{
          background: offlineReady ? "#e8f5e9" : "#fff8e1",
          border: 1px solid ${offlineReady ? "#a5d6a7" : "#ffe082"},
          borderRadius: 12, padding: "10px 14px",
          fontSize: 12, color: offlineReady ? "#2e7d32" : "#795548",
          marginBottom: 10, lineHeight: 1.6,
        }}>
          {offlineReady ? (
            <>✅ <strong>المحتوى محفوظ أوفلاين</strong> — تقدر تستخدم الموقع بدون نت</>
          ) : (
            <>📶 <strong>تلميح:</strong> افتح الموقع مرة وأنت متصل بالنت — بعدها كل المحتوى هيتحفظ تلقائياً وتقدر تشتغل أوفلاين</>
          )}
        </div>

        {/* PWA tip */}
        {showPWA && (
          <div style={{
            background: "#e3f2fd", border: "1px solid #90caf9",
            borderRadius: 12, padding: "10px 14px",
            fontSize: 12, color: "#0d47a1",
            marginBottom: 10, lineHeight: 1.7,
            position: "relative",
          }}>
            <button
              onClick={() => setShowPWA(false)}
              style={{ position: "absolute", top: 8, left: 10, background: "none", border: "none", fontSize: 16, cursor: "pointer", color: "#0d47a1" }}
            >✕</button>
            📱 <strong>أضف GP101 لشاشة جوالك زي تطبيق:</strong><br />
            {isIOS ? (
              <>اضغط على زرار <strong>Share ⬆️</strong> في Safari ← ثم <strong>"Add to Home Screen"</strong></>
            ) : (
              <>افتح قائمة المتصفح <strong>⋮</strong> ← ثم <strong>"Add to Home Screen"</strong> أو <strong>"Install App"</strong></>
            )}
          </div>
        )}
      </div>

      {/* Specialties Grid */}
      <div style={{ padding: "8px 16px 32px" }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0B1E3D", marginBottom: 14 }}>
          التخصصات
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12,
        }}>
          {SPECIALTIES.map((sp) => (
            <button
              key={sp.slug}
              onClick={() => router.push(`/content/${sp.slug}`)}
              style={{
                background: "#fff",
                border: "none",
                borderRadius: 16,
                padding: "20px 16px",
                textAlign: "right",
                cursor: "pointer",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                borderRight: 4px solid ${sp.color},
                transition: "transform 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{sp.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0B1E3D" }}>{sp.name}</div>
              <div style={{ fontSize: 11, color: "#6B7A8D", marginTop: 2 }}>{sp.en}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: "center", padding: "16px", fontSize: 11,
        color: "#9e9e9e", borderTop: "1px solid #e8edf3",
      }}>
        GP101 © 2026 — SNIMPLY
      </div>
    </div>
  );
}
