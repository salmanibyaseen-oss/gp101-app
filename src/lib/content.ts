"use client";
import { useState, useEffect } from "react";
import { Topic } from "@/lib/content";
import { NotesPanel } from "./NotesPanel";

const SECTION_COLORS: Record<string, string> = {
  "Medicine الباطنه": "#c0392b",
  "Surgery الجراحه": "#2980b9",
  "Pediatric الاطفال": "#e67e22",
  "OBGYN النساء": "#e91e8c",
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
          <div
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 notion-content"
            dir="rtl"
            dangerouslySetInnerHTML={{ __html: topic.content }}
          />

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
              <span>{showNotes ? "إخفاء الملاحظات" : hasNote ? "عرض ملاحظاتي" : "إضافة ملاحظة"}</span>
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
