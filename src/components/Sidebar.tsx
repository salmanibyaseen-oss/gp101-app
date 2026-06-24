"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Section } from "@/lib/content";

const SECTION_ICONS: Record<string, string> = {
  "Medicine الباطنه": "🩺",
  "Surgery الجراحه": "🔪",
  "Pediatric الاطفال": "👶",
  "BGYN النساء": "🤰",
  "ENT انف واذن": "👂",
  "Ophthalmology عيون": "👁",
  "Dermatology جلديه": "🩹",
  "Toxicology سموم": "☠️",
};

interface SidebarProps {
  sections: Section[];
  isAdmin?: boolean;
}

export function Sidebar({ sections, isAdmin }: SidebarProps) {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set([sections[0]?.name])
  );
  const [openSubs, setOpenSubs] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentSlug = pathname.split("/content/")[1];

  useEffect(() => {
    if (!currentSlug) return;
    for (const section of sections) {
      for (const sub of section.subsections) {
        if (sub.topics.some((t) => t.slug === currentSlug)) {
          setOpenSections((s) => {
            const n = new Set(s);
            n.add(section.name);
            return n;
          });
          setOpenSubs((s) => {
            const n = new Set(s);
            n.add(sub.name + section.name);
            return n;
          });
        }
      }
    }
  }, [currentSlug]);

  const toggleSection = (name: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const toggleSub = (key: string) => {
    setOpenSubs((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const filtered = search.trim()
    ? sections
        .map((s) => ({
          ...s,
          subsections: s.subsections
            .map((sub) => ({
              ...sub,
              topics: sub.topics.filter((t) =>
                t.title.toLowerCase().includes(search.toLowerCase())
              ),
            }))
            .filter((sub) => sub.topics.length > 0),
        }))
        .filter((s) => s.subsections.length > 0)
    : sections;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#1e3a5f] text-white">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold text-sm">
            GP
          </div>
          <div>
            <div className="font-bold text-sm">GP101</div>
            <div className="text-xs text-white/60">مرجع الممارس العام</div>
          </div>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 بحث..."
          className="w-full bg-white/10 text-white placeholder-white/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white/20"
        />
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {filtered.map((section) => (
          <div key={section.name}>
            <button
              onClick={() => toggleSection(section.name)}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white/90 hover:bg-white/10 transition-colors"
            >
              <span>{SECTION_ICONS[section.name] || "📋"}</span>
              <span className="flex-1 text-right">{section.name}</span>
              <span className="text-white/50 text-xs">
                {openSections.has(section.name) ? "▲" : "▼"}
              </span>
            </button>

            {openSections.has(section.name) && (
              <div>
                {section.subsections.map((sub) => {
                  const subKey = sub.name + section.name;
                  return (
                    <div key={sub.name}>
                      <button
                        onClick={() => toggleSub(subKey)}
                        className="w-full flex items-center gap-2 px-6 py-2 text-xs font-semibold text-[#0ea5e9] hover:bg-white/5 transition-colors"
                      >
                        <span className="flex-1 text-right">{sub.name}</span>
                        <span className="text-white/30">
                          {openSubs.has(subKey) ? "▲" : "▼"}
                        </span>
                      </button>

                      {openSubs.has(subKey) && (
                        <div>
                          {sub.topics.map((topic) => (
                            <Link
                              key={topic.slug}
                              href={`/content/${topic.slug}`}
                              onClick={() => setSidebarOpen(false)}
                              className={`block px-8 py-1.5 text-xs transition-colors hover:bg-white/10 ${
                                currentSlug === topic.slug
                                  ? "bg-[#0ea5e9]/20 text-[#0ea5e9] border-r-2 border-[#0ea5e9]"
                                  : "text-white/70"
                              }`}
                            >
                              {topic.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10 flex flex-col items-center gap-2">
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
          }}
          className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-100"
        >
          خروج
        </button>
        <div className="text-xs text-white/40">GP101 © 2026</div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-3 right-3 z-50 bg-[#1e3a5f] text-white p-2 rounded-lg"
      >
        ☰
      </button>

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`lg:hidden fixed top-0 right-0 h-full w-72 z-50 transition-transform ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>

      <div className="hidden lg:flex w-72 flex-shrink-0 h-full">
        {sidebarContent}
      </div>
    </>
  );
}
