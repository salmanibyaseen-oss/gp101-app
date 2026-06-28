"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function BookViewerPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [watermark, setWatermark] = useState("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    const blockContext = (e: MouseEvent) => e.preventDefault();
    const blockKeys = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ["s", "p", "u", "c"].includes(e.key.toLowerCase())) e.preventDefault();
      if (e.key === "F12") e.preventDefault();
    };
    document.addEventListener("contextmenu", blockContext);
    document.addEventListener("keydown", blockKeys);
    return () => {
      document.removeEventListener("contextmenu", blockContext);
      document.removeEventListener("keydown", blockKeys);
    };
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/books/${id}/view`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "غير مصرح بالوصول");
          setLoading(false);
          return;
        }
        setWatermark(data.watermark);
        setTitle(data.title);
        setPdfUrl(data.url);
        setLoading(false);
      } catch {
        setError("فشل تحميل الكتاب");
        setLoading(false);
      }
    }
    load();
  }, [id]);

  return (
    <div dir="rtl" style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#f6f9fc", fontFamily: "'Segoe UI', Arial, sans-serif", userSelect: "none" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0B1E3D 0%, #0E7C86 100%)", padding: "12px 16px", color: "#fff", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button onClick={() => router.push("/books")} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: "pointer" }}>
          → رجوع
        </button>
        <h1 style={{ fontSize: 16, fontWeight: 800, flex: 1 }}>{title || "الكتاب"}</h1>
        {watermark && (
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{watermark}</span>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {loading && (
          <div style={{ textAlign: "center", color: "#9e9e9e", padding: 60, fontSize: 14 }}>
            جاري تحميل الكتاب...
          </div>
        )}
        {error && (
          <div style={{ textAlign: "center", color: "#c62828", padding: 40, fontSize: 14 }}>
            {error}
          </div>
        )}

        {pdfUrl && (
          <>
            {/* PDF iframe */}
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
              style={{ width: "100%", height: "100%", border: "none" }}
              title={title}
            />

            {/* Watermark overlay */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              display: "flex", flexWrap: "wrap", alignContent: "center",
              justifyContent: "center", gap: 80, opacity: 0.08,
              transform: "rotate(-30deg)", zIndex: 50,
            }}>
              {Array.from({ length: 40 }).map((_, i) => (
                <span key={i} style={{ fontSize: 14, fontWeight: 700, color: "#0B1E3D", whiteSpace: "nowrap" }}>
                  {watermark}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
