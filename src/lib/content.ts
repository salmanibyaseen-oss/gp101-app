import contentData from "../../data/content.json";

export interface Topic {
 title: string;
 slug: string;
 icon?: string;
 content: string;
 html?: string;
}

export interface Subsection {
 name: string;
 topics: Topic[];
}

export interface Section {
 name: string;
 subsections: Subsection[];
}

export interface ContentData {
 sections: Section[];
}

export const content = contentData as ContentData;

// نسخة خفيفة من الأقسام بدون محتوى المواضيع - للاستخدام في الـ Sidebar
// لأن الـ Sidebar محتاج بس العناوين والـ slugs مش النص الكامل لكل موضوع
export interface NavTopic {
  title: string;
  slug: string;
  icon?: string;
}
export interface NavSubsection {
  name: string;
  topics: NavTopic[];
}
export interface NavSection {
  name: string;
  subsections: NavSubsection[];
}

export function getNavigationSections(): NavSection[] {
  return content.sections.map((section) => ({
    name: section.name,
    subsections: section.subsections.map((sub) => ({
      name: sub.name,
      topics: sub.topics.map((t) => ({
        title: t.title,
        slug: t.slug,
        icon: t.icon,
      })),
    })),
  }));
}

export function getAllSlugs(): string[] {
 return content.sections.flatMap((s) =>
   s.subsections.flatMap((sub) => sub.topics.map((t) => encodeURIComponent(t.slug)))
 );
}

export function getTopicBySlug(slug: string): Topic | null {
 const decoded = decodeURIComponent(slug);
 for (const section of content.sections) {
   for (const sub of section.subsections) {
     const topic = sub.topics.find(
       (t) => t.slug === decoded || t.slug === slug
     );
     if (topic) {
       return {
         ...topic,
         content: (topic as any).html || (topic as any).content || "",
       };
     }
   }
 }
 return null;
}

export function getTopicContext(slug: string): {
 section: Section;
 subsection: Subsection;
 topic: Topic;
} | null {
 const decoded = decodeURIComponent(slug);
 for (const section of content.sections) {
   for (const sub of section.subsections) {
     const topic = sub.topics.find(
       (t) => t.slug === decoded || t.slug === slug
     );
     if (topic) return { section, subsection: sub, topic };
   }
 }
 return null;
}
