"use client";
// src/components/ContentView.tsx
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Topic } from "@/lib/content";
import { NotesPanel } from "./NotesPanel";

interface ContentViewProps {
  topic: Topic;
  breadcrumb: { section: string; subsection: string } | null;
}

export function ContentView({ topic, breadcrumb }: ContentViewProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [hasNote, setHasNote] = useState(false);

  // Check if topic has a note
  useEffect(() => {
    fetch(`/api/notes?slug=${topic.slug}`)
      .then((r) => r.json())
      .then((d) => setHasNote(!!d.note?.content))
      .catch(() => {});
  }, [topic.slug]);

  return (
    <div className="flex h-full">
      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Breadcrumb */}
          {breadcrumb && (
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
              <span>{breadcrumb.section}</span>
              <span>›</span>
              <span>{breadcrumb.subsection}</span>
            </div>
          )}

          {/* Topic content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="prose-medical">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-xl font-bold text-[#1e3a5f] border-b-2 border-[#0ea5e9] pb-2 mb-4">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-base font-bold text-[#2d5a9e] mt-5 mb-2">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-semibold text-gray-700 mt-3 mb-1">{children}</h3>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-[#1e3a5f] font-bold">{children}</strong>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pr-5 space-y-0.5 text-sm">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pr-5 space-y-0.5 text-sm">{children}</ol>
                  ),
                  li: ({ children }) => <li className="text-gray-800">{children}</li>,
                  p: ({ children }) => <p className="text-sm text-gray-800 mb-2">{children}</p>,
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-3">
                      <table className="w-full text-xs border-collapse">{children}</table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="bg-[#1e3a5f] text-white px-3 py-1.5 text-right font-semibold">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-gray-200 px-3 py-1.5 text-gray-800">{children}</td>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-r-4 border-[#0ea5e9] bg-blue-50 pr-4 py-2 my-3 text-sm text-gray-700 rounded-l">
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
                      <code className="bg-red-50 text-red-700 px-1 py-0.5 rounded text-xs font-mono">
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {topic.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* Notes toggle button */}
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
              <span>{showNotes ? "إخفاء الملاحظات" : hasNote ? "عرض ملاحظاتي" : "إضافة ملاحظة"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notes panel */}
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
