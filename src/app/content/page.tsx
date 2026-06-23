export const dynamic = 'force-dynamic';
import { redirect } from "next/navigation";
import { content } from "@/lib/content";

export default function ContentPage() {
  const firstSlug = content.sections[0]?.subsections[0]?.topics[0]?.slug;
  if (firstSlug) {
    redirect(`/content/${firstSlug}`);
  }
  redirect("/login");
}
