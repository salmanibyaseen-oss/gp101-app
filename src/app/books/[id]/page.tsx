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
  const [progress, setProgress] = useState(0);

  // منع كليك يمين والكيبورد
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
        // جيب معلومات الكتاب أولاً
        const infoRes = await fetch(`/api/books/${id}/view?mode=info`);
        const info = await infoRes.json();
        if (!infoRes.ok) {
          setError(info.error || "غير مصرح بالوصول");
          setLoading(false);
          return;
        }
        setWatermark(info.watermark);
        setTitle(info.title);

        // جيب الـ PDF عبر الـ proxy
        const pdfRes = await fetch(`/api/books/${id}/view?mode=pdf`);
        if (!pdfRes.ok) {
          setError("فشل تحميل الكتاب");
          setLoading(false);
          return;
        }

        const buf = await pdfRes.arrayBuffer();
        if (cancelled) return;

        // رسم الـ PDF بـ PDF.js
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs";

        const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
        const total = pdf.numPages;

        if (cancelled || !containerRef.current) return;
        containerRef.current.innerHTML = "";

        for (let i = 1; i <= total; i++) {
          if (cancelled) return;
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.cssText = "display:block;margin:0 auto 12px;max-width:100%;box-shadow:0 2px 12px rgba(0,0,0,0.1);border-radius:4px;";
          const ctx = canvas.getContext("2d")!;
          await page.render({ canvasContext: ctx, viewport }).promise;

          // أضف الـ watermark على كل صفحة
          ctx.save();
          ctx.globalAlpha = 0.08;
          ctx.font = "bold 28px Arial";
          ctx.fillStyle = "#0B1E3D";
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate(-Math.PI / 6);
          ctx.textAlign = "center";
          for (let r = -canvas.height; r < canvas.height; r += 120) {
            for (let c = -canvas.width; c < canvas.width; c += 300) {
              ctx.fillText(info.watermark, c, r);
            }
          }
          ctx.restore();

          if (containerRef.current) containerRef.current.appendChild(canvas);
          setProgress(Math.round((i / total) * 100));
        }

        setLoading(false);
      } catch (e) {
        if (!cancelled) {
          setError("فشل تحميل الكتاب");
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  return (
    <div
      dir="rtl"
      style={{ minHeight: "100vh", background: "#1a1a2e", fontFamily: "'Segoe UI', Arial, sans-serif", userSelect: "none" }}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0B1E3D 0%, #0E7C86 100%)", padding: "12px 16px", color: "#fff", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 100 }}>
        <button
          onClick={() => router.push("/books")}
          style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: "pointer" }}
        >
          → رجوع
        </button>
        <h1 style={{ fontSize: 15, fontWeight: 800, flex: 1 }}>{title || "الكتاب"}</h1>
        {loading && progress > 0 && (
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{progress}%</span>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "16px 8px", maxWidth: 900, margin: "0 auto" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div style={{ color: "#fff", fontSize: 14, marginBottom: 16 }}>
              {progress > 0 ? `جاري تحميل الصفحات... ${progress}%` : "جاري تحميل الكتاب..."}
            </div>
            {progress > 0 && (
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 8, height: 6, overflow: "hidden", maxWidth: 300, margin: "0 auto" }}>
                <div style={{ background: "#0E7C86", height: "100%", width: `${progress}%`, transition: "width 0.3s" }} />
              </div>
            )}
          </div>
        )}

        {error && (
          <div style={{ textAlign: "center", color: "#ef5350", padding: 40, fontSize: 14 }}>
            🔒 {error}
          </div>
        )}

        <div ref={containerRef} />
      </div>
    </div>
  );
}
