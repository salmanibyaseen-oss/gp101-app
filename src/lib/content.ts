import contentData from "../../data/content.json";

export interface Topic {
  title: string;
  slug: string;
  content: string;
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
      if (topic) return topic;
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
