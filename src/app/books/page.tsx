"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Book {
  name: string;
  sizeMB: string | null;
  url: string | null;
}

export default function BooksPage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/books")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        setBooks(d.books || []);
      })
      .catch(() => setError("حدث خطأ في تحميل الكتب"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#f6f9fc", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      <div style={{ background: "linear-gradient(135deg, #0B1E3D 0%, #0E7C86 100%)", padding: "20px 16px", color: "#fff", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.push("/dashboard")} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: "pointer" }}>
          → رجوع
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 800 }}>📚 الكتب الطبية</h1>
      </div>

      <div style={{ padding: 16 }}>
        {loading && <div style={{ textAlign: "center", color: "#9e9e9e", padding: 40 }}>جاري التحميل...</div>}

        {!loading && error && (
          <div style={{ textAlign: "center", color: "#c62828", padding: 24, background: "#fff", borderRadius: 12 }}>
            {error}
          </div>
        )}

        {!loading && !error && books.length === 0 && (
          <div style={{ textAlign: "center", color: "#9e9e9e", padding: 40 }}>لا توجد كتب متاحة حالياً</div>
        )}

        {!loading && books.map((book) => (
          <div key={book.name} style={{
            background: "#fff", borderRadius: 16, padding: "16px",
            marginBottom: 12, display: "flex", alignItems: "center", gap: 14,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)", borderRight: "4px solid #F4A723",
          }}>
            <div style={{ fontSize: 28 }}>📕</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "#0B1E3D", fontSize: 14 }}>{book.name}</div>
              {book.sizeMB && <div style={{ fontSize: 11, color: "#6B7A8D" }}>{book.sizeMB} MB</div>}
            </div>
            {book.url && (
              <a href={book.url} target="_blank" rel="noopener noreferrer" style={{
                background: "#0E7C86", color: "#fff", borderRadius: 10,
                padding: "8px 14px", fontSize: 13, fontWeight: 700, textDecoration: "none",
              }}>
                فتح
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
