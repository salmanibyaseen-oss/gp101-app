"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function BookViewerPage() {
  const { id } = useParams();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/books/${id}/view`);
        const data = await res.json();
        if (!res.ok) { setError(data.error || "غير مصرح بالوصول"); setLoading(false); return; }
        setWatermark(data.watermark);
        setTitle(data.title);

        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs";

        const fileRes = await fetch(data.url);
        const buf = await fileRes.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buf }).promise;

        if (cancelled || !containerRef.current) return;
        containerRef.current.innerHTML = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.3 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.display = "block";
          canvas.style.margin = "0 auto 12px";
          canvas.style.maxWidth = "100%";
          canvas.style.boxShadow = "0 2px 12px rgba(0,0,0,0.1)";
          const ctx = canvas.getContext("2d")!;
          await page.render({ canvasContext: ctx, viewport }).promise;
          containerRef.current.appendChild(canvas);
        }
        setLoading(false);
      } catch {
        setError("فشل تحميل الكتاب");
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#f6f9fc", fontFamily: "'Segoe UI', Arial, sans-serif", userSelect: "none" }}>
      <div style={{ background: "linear-gradient(135deg, #0B1E3D 0%, #0E7C86 100%)", padding: "20px 16px", color: "#fff", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.push("/books")} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: "pointer" }}>
          → رجوع
        </button>
        <h1 style={{ fontSize: 16, fontWeight: 800 }}>{title || "الكتاب"}</h1>
      </div>

      <div style={{ position: "relative", padding: 16 }}>
        {loading && <div style={{ textAlign: "center", color: "#9e9e9e", padding: 60 }}>جاري تحميل الكتاب...</div>}
        {error && <div style={{ textAlign: "center", color: "#c62828", padding: 40 }}>{error}</div>}
        <div ref={containerRef} style={{ position: "relative" }} />

        {!loading && !error && (
          <div style={{
            position: "fixed", inset: 0, pointerEvents: "none",
            display: "flex", flexWrap: "wrap", alignContent: "center",
            justifyContent: "center", gap: 80, opacity: 0.12,
            transform: "rotate(-30deg)", zIndex: 50,
          }}>
            {Array.from({ length: 40 }).map((_, i) => (
              <span key={i} style={{ fontSize: 14, fontWeight: 700, color: "#0B1E3D", whiteSpace: "nowrap" }}>
                {watermark}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
