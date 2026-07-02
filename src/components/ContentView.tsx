"use client";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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

// ── Collapsible Section Component ─────────────────────────────────────────
function CollapsibleSection({
  title,
  children,
  color,
  level = 2,
  defaultOpen = false,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  color: string;
  level?: number;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (level === 2) {
    return (
      <div style={{ marginTop: 20, marginBottom: 4 }}>
        <button
          onClick={() => setOpen(!open)}
          style={{
            width: "100%", display: "flex", alignItems: "center",
            gap: 10, background: "none", border: "none",
            cursor: "pointer", padding: "8px 0", textAlign: "right",
          }}
        >
          <span style={{
            fontSize: 11, color: color,
            transition: "transform 0.2s",
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            display: "inline-block", flexShrink: 0,
          }}>▶</span>
          <div style={{
            width: 4, height: 18, borderRadius: 2,
            background: color, flexShrink: 0,
          }} />
          <span style={{
            fontSize: 14, fontWeight: 800,
            color: color, letterSpacing: 0.3,
            textTransform: "uppercase", flex: 1, textAlign: "right",
          }}>
            {title}
          </span>
        </button>
        <div style={{ height: 1, background: `${color}22`, marginBottom: 8 }} />
        {open && (
          <div style={{ paddingRight: 22, paddingBottom: 8 }}>
            {children}
          </div>
        )}
      </div>
    );
  }

  // H3 — sub-collapsible
  return (
    <div style={{ marginTop: 10, marginBottom: 2 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          gap: 8, background: "none", border: "none",
          cursor: "pointer", padding: "5px 0",
          textAlign: "left", direction: "ltr",
        }}
      >
        <span style={{
          fontSize: 10, color: `${color}99`,
          transition: "transform 0.2s",
          transform: open ? "rotate(90deg)" : "rotate(0deg)",
          display: "inline-block", flexShrink: 0,
        }}>▶</span>
        <span style={{
          fontSize: 13, fontWeight: 700,
          color: "#374151", flex: 1, textAlign: "left",
          borderLeft: `2px solid ${color}44`,
          paddingLeft: 8,
        }}>
          {title}
        </span>
      </button>
      {open && (
        <div style={{ paddingLeft: 20, marginTop: 2, direction: "ltr" }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── Notion-style Toggle (for top-level bullet points) ─────────────────────
function NotionToggle({
  title,
  children,
  color,
}: {
  title: string;
  children: React.ReactNode;
  color: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      marginBottom: 6,
      borderRadius: 10,
      border: `1px solid ${color}22`,
      overflow: "hidden",
      background: open ? `${color}06` : "#fafafa",
      transition: "background 0.2s",
    }}>
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          gap: 10, background: "none", border: "none",
          cursor: "pointer", padding: "12px 14px",
          textAlign: "left", direction: "ltr",
        }}
      >
        {/* Arrow */}
        <span style={{
          fontSize: 12, color: color,
          transition: "transform 0.2s",
          transform: open ? "rotate(90deg)" : "rotate(0deg)",
          display: "inline-block", flexShrink: 0,
        }}>▶</span>

        {/* Title */}
        <span style={{
          fontSize: 15, fontWeight: 700,
          color: "#0B1E3D", flex: 1,
          textAlign: "left",
        }}>
          {title.replace(/\*{1,3}/g, "")}
        </span>

        {/* Color dot */}
        <span style={{
          width: 8, height: 8, borderRadius: "50%",
          background: color, flexShrink: 0, opacity: 0.7,
        }} />
      </button>

      {/* Content */}
      {open && (
        <div style={{
          borderTop: `1px solid ${color}18`,
          padding: "12px 18px 14px",
          background: "#fff",
          direction: "ltr",
          textAlign: "left",
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── Parse top-level bullet list into toggle items ─────────────────────────
function parseTopLevelToggles(content: string): Array<{ title: string; body: string }> | null {
  const lines = content.split("\n");

  // Check if content starts with top-level bullet points (- **Title** or - ***Title***)
  const firstMeaningful = lines.find((l) => l.trim());
  if (!firstMeaningful || !firstMeaningful.match(/^- \*{1,3}/)) return null;

  const items: Array<{ title: string; body: string[] }> = [];
  let current: { title: string; body: string[] } | null = null;

  for (const line of lines) {
    const topMatch = line.match(/^- \*{1,3}(.+?)\*{1,3}(.*)$/);
    if (topMatch) {
      if (current) items.push(current);
      const rest = topMatch[2]?.trim() || "";
      current = { title: topMatch[1], body: rest ? [rest] : [] };
    } else {
      if (current) {
        // Remove one level of indentation (2 or 4 spaces)
        current.body.push(line.replace(/^ {2}/, ""));
      }
    }
  }
  if (current) items.push(current);

  return items.length > 0 ? items.map((i) => ({ title: i.title, body: i.body.join("\n") })) : null;
}

// ── Normalize Notion 4-space indent → 2-space ─────────────────────────────
function normalizeIndent(md: string): string {
  return md;
}

// ── Mini Markdown renderer ────────────────────────────────────────────────
function MiniMarkdown({ content, color }: { content: string; color: string }) {
  const normalized = normalizeIndent(content);
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: () => null,
        h2: () => null,
        h3: () => null,

        strong: ({ children }) => (
          <strong style={{ fontWeight: 800, color: "#111827" }}>{children}</strong>
        ),

        ul: ({ children }) => (
          <ul style={{ listStyle: "none", padding: 0, margin: "4px 0" }}>{children}</ul>
        ),

        ol: ({ children }) => (
          <ol style={{ listStyle: "none", padding: 0, margin: "4px 0" }}>{children}</ol>
        ),

        li: ({ children }) => {
          const childArray = Array.isArray(children) ? children : [children];
          const first: React.ReactNode[] = [];
          const rest: React.ReactNode[] = [];
          let seenSub = false;
          childArray.forEach((child) => {
            if (!seenSub) {
              if (child && typeof child === "object" && "type" in (child as any) &&
                ((child as any).type === "ul" || (child as any).type === "ol")) {
                seenSub = true;
                rest.push(child);
              } else {
                first.push(child);
              }
            } else {
              rest.push(child);
            }
          });
          return (
            <li style={{ marginBottom: 5 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{
                  marginTop: 6, width: 6, height: 6, borderRadius: "50%",
                  flexShrink: 0, background: color, opacity: 0.7,
                }} />
                <span style={{ fontSize: 13, color: "#1f2937", lineHeight: 1.7, flex: 1 }}>
                  {first}
                </span>
              </div>
              {rest.length > 0 && (
                <div style={{ paddingRight: 22, marginTop: 3 }}>{rest}</div>
              )}
            </li>
          );
        },

        p: ({ children }) => (
          <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.8, marginBottom: 6 }}>
            {children}
          </p>
        ),

        blockquote: ({ children }) => (
          <blockquote style={{
            borderRight: `4px solid ${color}`,
            background: `${color}0d`,
            paddingRight: 14, paddingLeft: 10,
            paddingTop: 8, paddingBottom: 8,
            margin: "10px 0", borderRadius: "0 8px 8px 0",
            fontSize: 13, color: "#374151",
          }}>
            {children}
          </blockquote>
        ),

        table: ({ children }) => (
          <div style={{ overflowX: "auto", margin: "10px 0" }}>
            <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th style={{
            background: color, color: "#fff",
            padding: "7px 10px", textAlign: "right", fontWeight: 700, fontSize: 12,
          }}>{children}</th>
        ),
        td: ({ children }) => (
          <td style={{
            border: "1px solid #e5e7eb",
            padding: "6px 10px", color: "#374151", fontSize: 12,
          }}>{children}</td>
        ),

        code: ({ children, className }) => {
          const isBlock = className?.includes("language-");
          return isBlock ? (
            <pre style={{
              background: "#1f2937", color: "#f9fafb",
              borderRadius: 8, padding: 14,
              overflowX: "auto", fontSize: 12, margin: "10px 0",
            }}>
              <code>{children}</code>
            </pre>
          ) : (
            <code style={{
              color: color, background: `${color}12`,
              padding: "1px 5px", borderRadius: 4,
              fontSize: 12, fontFamily: "monospace",
            }}>
              {children}
            </code>
          );
        },
      }}
    >
      {normalized}
    </ReactMarkdown>
  );
}

// ── Parse Markdown into sections ──────────────────────────────────────────
function parseIntoSections(content: string) {
  const lines = content.split("\n");
  const result: Array<{
    type: "h1" | "h2" | "h3" | "text";
    text: string;
    children: string[];
  }> = [];

  let current: { type: "h1" | "h2" | "h3" | "text"; text: string; children: string[] } | null = null;

  for (const line of lines) {
    if (line.startsWith("# ")) {
      if (current) result.push(current);
      current = { type: "h1", text: line.slice(2), children: [] };
    } else if (line.startsWith("## ")) {
      if (current) result.push(current);
      current = { type: "h2", text: line.slice(3), children: [] };
    } else if (line.startsWith("### ")) {
      if (current) result.push(current);
      current = { type: "h3", text: line.slice(4), children: [] };
    } else {
      if (!current) current = { type: "text", text: "", children: [] };
      current.children.push(line);
    }
  }
  if (current) result.push(current);
  return result;
}

// ── Main ContentView ──────────────────────────────────────────────────────
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

  const sections = parseIntoSections(topic.content);

  const renderSections = () => {
    const output: React.ReactNode[] = [];
    let i = 0;

    while (i < sections.length) {
      const sec = sections[i];

      if (sec.type === "h1") {
        output.push(
          <h1 key={"h1-" + i} style={{
            color: sectionColor, fontSize: 22, fontWeight: 900,
            borderBottom: `3px solid ${sectionColor}`,
            paddingBottom: 10, marginBottom: 16, letterSpacing: 0.3,
          }}>
            {sec.text}
          </h1>
        );
        const h1Body = sec.children.join("\n");
        if (h1Body.trim()) {
          // ✅ Try to parse as Notion toggles first
          const toggles = parseTopLevelToggles(h1Body);
          if (toggles) {
            output.push(
              <div key={"h1-toggles-" + i}>
                {toggles.map((item, idx) => (
                  <NotionToggle key={idx} title={item.title} color={sectionColor}>
                    <MiniMarkdown content={item.body} color={sectionColor} />
                  </NotionToggle>
                ))}
              </div>
            );
          } else {
            output.push(
              <MiniMarkdown key={"h1-body-" + i} content={h1Body} color={sectionColor} />
            );
          }
        }
        i++;
        continue;
      }

      if (sec.type === "h2") {
        const childContent: string[] = [...sec.children];
        let j = i + 1;
        while (j < sections.length && sections[j].type !== "h2" && sections[j].type !== "h1") {
          const sub = sections[j];
          if (sub.type === "h3") {
            childContent.push(`### ${sub.text}`, ...sub.children);
          } else {
            childContent.push(...sub.children);
          }
          j++;
        }
        const bodyText = childContent.join("\n");
        output.push(
          <div key={i}>
            <h2 style={{
              color: sectionColor, fontSize: 17, fontWeight: 700,
              borderBottom: `2px solid ${sectionColor}33`,
              paddingBottom: 6, marginTop: 20, marginBottom: 10,
            }}>
              {sec.text}
            </h2>
            {bodyText.trim() && <MiniMarkdown content={bodyText} color={sectionColor} />}
          </div>
        );
        i = j;
        continue;
      }

      if (sec.type === "h3") {
        const bodyText = sec.children.join("\n");
        output.push(
          <CollapsibleSection key={i} title={sec.text} color={sectionColor} level={3}>
            <MiniMarkdown content={bodyText} color={sectionColor} />
          </CollapsibleSection>
        );
        i++;
        continue;
      }

      // plain text — try toggles first
      const bodyText = sec.children.join("\n");
      if (bodyText.trim()) {
        const toggles = parseTopLevelToggles(bodyText);
        if (toggles) {
          output.push(
            <div key={i}>
              {toggles.map((item, idx) => (
                <NotionToggle key={idx} title={item.title} color={sectionColor}>
                  <MiniMarkdown content={item.body} color={sectionColor} />
                </NotionToggle>
              ))}
            </div>
          );
        } else {
          output.push(
            <MiniMarkdown key={i} content={bodyText} color={sectionColor} />
          );
        }
      }
      i++;
    }

    return output;
  };

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
            {renderSections()}
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
