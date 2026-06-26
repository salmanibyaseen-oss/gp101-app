"use client";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Topic } from "@/lib/content";
import { NotesPanel } from "./NotesPanel";

const SECTION_COLORS: Record<string, string> = {
  "Medicine الباطنه": "#c0392b",
  "Surgery الجراحه": "#2980b9",
  "Pediatric الاطفال": "#e67e22",
  "BGYN النساء": "#e91e8c",
  "ENT انف واذن": "#27ae60",
  "Ophthalmology عيون": "#795548",
  "Dermatology جلديه": "#8e44ad",
  "Toxicology سموم": "#7f8c8d",
};

interface ContentViewProps {
  topic: Topic;
  breadcrumb: { section: string; subsection: string } | null;
}

export function ContentView({ topic, breadcrumb }: ContentViewProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [hasNote, setHasNote] = useState(false);

  const sectionColor = breadcrumb
    ? SECTION_COLORS[breadcrumb.section] || "#1e3a5f"
    : "#1e3a5f";

  useEffect(() => {
    fetch(`/api/notes?slug=${topic.slug}`)
      .then((r) => r.json())
      .then((d) => setHasNote(!!d.note?.content))
      .catch(() => {});
  }, [topic.slug]);

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">

          {/* Breadcrumb */}
          {breadcrumb && (
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
              <span style={{ color: sectionColor }}>{breadcrumb.section}</span>
              <span>›</span>
              <span>{breadcrumb.subsection}</span>
            </div>
          )}

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6" dir="ltr">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{

                // H1 — عنوان الموضوع
                h1: ({ children }) => (
                  <h1
                    style={{
                      color: sectionColor,
                      fontSize: 22, fontWeight: 900,
                      borderBottom: `3px solid ${sectionColor}`,
                      paddingBottom: 10, marginBottom: 20,
                      letterSpacing: 0.3,
                    }}
                  >
                    {children}
                  </h1>
                ),

                // H2 — section رئيسي (ER, Investigation, إلخ)
                h2: ({ children }) => (
                  <div
                    style={{
                      marginTop: 24, marginBottom: 10,
                      display: "flex", alignItems: "center", gap: 8,
                    }}
                  >
                    <div style={{
                      width: 4, height: 20, borderRadius: 2,
                      background: sectionColor, flexShrink: 0,
                    }} />
                    <h2 style={{
                      color: sectionColor,
                      fontSize: 15, fontWeight: 900,
                      letterSpacing: 0.4, margin: 0,
                      textTransform: "uppercase",
                    }}>
                      {children}
                    </h2>
                  </div>
                ),

                // H3 — sub-section
                h3: ({ children }) => (
                  <h3 style={{
                    fontSize: 13, fontWeight: 700,
                    color: "#374151", marginTop: 14, marginBottom: 4,
                    paddingRight: 10,
                    borderRight: `2px solid ${sectionColor}44`,
                  }}>
                    {children}
                  </h3>
                ),

                // Strong — bold = عنوان فرعي بخط Notion
                strong: ({ children }) => (
                  <strong style={{
                    fontWeight: 800, color: "#111827",
                    fontSize: "1em",
                  }}>
                    {children}
                  </strong>
                ),

                // UL — القائمة الرئيسية
                ul: ({ children }) => (
                  <ul style={{
                    listStyle: "none", padding: 0, margin: "6px 0",
                  }}>
                    {children}
                  </ul>
                ),

                // OL
                ol: ({ children }) => (
                  <ol style={{
                    listStyle: "none", padding: 0, margin: "6px 0",
                    counterReset: "ol-counter",
                  }}>
                    {children}
                  </ol>
                ),

                // LI — notion-style: bold أول سطر + indent للباقي
                li: ({ children }) => {
                  const childArray = Array.isArray(children) ? children : [children];

                  // انفصل المحتوى لـ paragraphs وغيرها
                  const first: React.ReactNode[] = [];
                  const rest: React.ReactNode[] = [];
                  let seenPara = false;

                  childArray.forEach((child) => {
                    if (!seenPara) {
                      first.push(child);
                      // لو شوفنا ul/ol جوه = sub-list → بعتها للـ rest
                      if (
                        child &&
                        typeof child === "object" &&
                        "type" in (child as any) &&
                        ((child as any).type === "ul" || (child as any).type === "ol")
                      ) {
                        seenPara = true;
                        first.pop();
                        rest.push(child);
                      }
                    } else {
                      rest.push(child);
                    }
                  });

                  return (
                    <li style={{ marginBottom: 6 }}>
                      {/* السطر الأول */}
                      <div style={{
                        display: "flex", alignItems: "flex-start", gap: 8,
                      }}>
                        <span style={{
                          marginTop: 5, width: 6, height: 6,
                          borderRadius: "50%", flexShrink: 0,
                          background: sectionColor, opacity: 0.7,
                        }} />
                        <span style={{
                          fontSize: 13, color: "#1f2937", lineHeight: 1.7,
                          flex: 1,
                        }}>
                          {first}
                        </span>
                      </div>
                      {/* Sub-items مندرجة */}
                      {rest.length > 0 && (
                        <div style={{ paddingRight: 22, marginTop: 4 }}>
                          {rest}
                        </div>
                      )}
                    </li>
                  );
                },

                // P
                p: ({ children }) => (
                  <p style={{
                    fontSize: 13, color: "#374151",
                    lineHeight: 1.8, marginBottom: 8,
                  }}>
                    {children}
                  </p>
                ),

                // Table
                table: ({ children }) => (
                  <div style={{ overflowX: "auto", margin: "12px 0" }}>
                    <table style={{
                      width: "100%", fontSize: 12,
                      borderCollapse: "collapse",
                    }}>
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th style={{
                    background: sectionColor, color: "#fff",
                    padding: "8px 12px", textAlign: "right",
                    fontWeight: 700, fontSize: 12,
                  }}>
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td style={{
                    border: "1px solid #e5e7eb",
                    padding: "7px 12px", color: "#374151", fontSize: 12,
                  }}>
                    {children}
                  </td>
                ),

                // Blockquote — تنبيه / ملاحظة
                blockquote: ({ children }) => (
                  <blockquote style={{
                    borderRight: `4px solid ${sectionColor}`,
                    background: `${sectionColor}0d`,
                    paddingRight: 14, paddingLeft: 10,
                    paddingTop: 10, paddingBottom: 10,
                    margin: "12px 0", borderRadius: "0 8px 8px 0",
                    fontSize: 13, color: "#374151",
                  }}>
                    {children}
                  </blockquote>
                ),

                // Code
                code: ({ children, className }) => {
                  const isBlock = className?.includes("language-");
                  return isBlock ? (
                    <pre style={{
                      background: "#1f2937", color: "#f9fafb",
                      borderRadius: 8, padding: 16,
                      overflowX: "auto", fontSize: 12, margin: "12px 0",
                    }}>
                      <code>{children}</code>
                    </pre>
                  ) : (
                    <code style={{
                      color: sectionColor,
                      background: `${sectionColor}12`,
                      padding: "1px 6px", borderRadius: 4,
                      fontSize: 12, fontFamily: "monospace",
                    }}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {topic.content}
            </ReactMarkdown>
          </div>

          {/* Notes button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showNotes
                  ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                  : hasNote
                  ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                  : "bg-gray-100 text-gray-600 hover:bg-yellow-50 hover:text-yellow-700"
              }`}
            >
              <span>📝</span>
              <span>
                {showNotes ? "إخفاء الملاحظات" : hasNote ? "عرض ملاحظاتي" : "إضافة ملاحظة"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {showNotes && (
        <NotesPanel
          slug={topic.slug}
          onNoteChange={setHasNote}
          onClose={() => setShowNotes(false)}
        />
      )}
    </div>
  );
}
