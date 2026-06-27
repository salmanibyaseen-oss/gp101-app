"use client";
import { useState, useEffect } from "react";

interface NotesPanelProps {
  slug: string;
  onNoteChange: (hasNote: boolean) => void;
  onClose: () => void;
}

export function NotesPanel({ slug, onNoteChange, onClose }: NotesPanelProps) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/notes?slug=${slug}`)
      .then((r) => r.json())
      .then((d) => setNote(d.note?.content || ""))
      .catch(() => {});
  }, [slug]);

  const save = async () => {
    setSaving(true);
    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, content: note }),
    });
    onNoteChange(!!note);
    setSaving(false);
  };

  return (
    <div className="w-80 border-l border-gray-200 bg-yellow-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-yellow-200">
        <h3 className="font-medium text-yellow-800">📝 ملاحظاتي</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>
      <div className="flex-1 p-4 flex flex-col gap-3">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="اكتب ملاحظاتك هنا..."
          className="flex-1 w-full p-3 rounded-lg border border-yellow-200 bg-white resize-none text-sm"
          dir="rtl"
          rows={10}
        />
        <button
          onClick={save}
          disabled={saving}
          className="w-full py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 disabled:opacity-50"
        >
          {saving ? "جاري الحفظ..." : "حفظ"}
        </button>
      </div>
    </div>
  );
}
