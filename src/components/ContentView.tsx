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
                h1: ({ children }) => (
                  <h1
                    style={{ color: sectionColor }}
                    className="text-2xl font-bold border-b-2 pb-2 mb-4"
                  >
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2
                    style={{ color: sectionColor }}
                    className="text-lg font-bold mt-6 mb-2"
                  >
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-semibold text-gray-700 mt-4 mb-1">
                    {children}
                  </h3>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-gray-900">{children}</strong>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pr-5 space-y-1 text-sm text-gray-800 my-2">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pr-5 space-y-1 text-sm text-gray-800 my-2">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed">{children}</li>
                ),
                p: ({ children }) => (
                  <p className="text-sm text-gray-800 leading-relaxed mb-2">
                    {children}
                  </p>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-3">
                    <table className="w-full text-xs border-collapse">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th
                    style={{ backgroundColor: sectionColor }}
                    className="text-white px-3 py-2 text-right font-semibold"
                  >
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-gray-200 px-3 py-1.5 text-gray-800">
                    {children}
                  </td>
                ),
                blockquote: ({ children }) => (
                  <blockquote
                    style={{ borderColor: sectionColor }}
                    className="border-r-4 bg-gray-50 pr-4 py-2 my-3 text-sm text-gray-700 rounded-l"
                  >
                    {children}
                  </blockquote>
                ),
                code: ({ children, className }) => {
                  const isBlock = className?.includes("language-");
                  return isBlock ? (
                    <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-xs my-3">
                      <code>{children}</code>
                    </pre>
                  ) : (
                    <code
                      style={{ color: sectionColor }}
                      className="bg-gray-50 px-1 py-0.5 rounded text-xs font-mono"
                    >
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
                {showNotes
                  ? "إخفاء الملاحظات"
                  : hasNote
                  ? "عرض ملاحظاتي"
                  : "إضافة ملاحظة"}
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
