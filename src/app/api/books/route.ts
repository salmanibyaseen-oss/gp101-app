import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabase.storage.from("Books").list("", {
    limit: 100,
    sortBy: { column: "name", order: "asc" },
  });

  if (error) {
    return NextResponse.json({ books: [], error: error.message }, { status: 500 });
  }

  const books = await Promise.all(
    (data || [])
      .filter((f) => f.name && !f.name.startsWith("."))
      .map(async (file) => {
        const { data: urlData } = await supabase.storage
          .from("Books")
          .createSignedUrl(file.name, 60 * 60); // الرابط صالح لساعة

        return {
          name: file.name,
          sizeMB: file.metadata?.size
            ? (file.metadata.size / (1024 * 1024)).toFixed(2)
            : null,
          url: urlData?.signedUrl || null,
        };
      })
  );

  return NextResponse.json({ books });
}
