import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function clean(value: unknown, max = 4000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  const heroHeading = clean(body?.heroHeading, 300);
  const heroBody = clean(body?.heroBody, 3000);
  const heroCtaLabel = clean(body?.heroCtaLabel, 120);
  const heroCtaUrl = clean(body?.heroCtaUrl, 500);
  const footerBrandLine = clean(body?.footerBrandLine, 300);
  const heroImageUrl = clean(body?.heroImageUrl, 1500);

  if (!heroHeading || !heroBody || !heroCtaLabel || !heroCtaUrl || !footerBrandLine) {
    return NextResponse.json({ error: "Required content fields are missing." }, { status: 400 });
  }

  const { data: page } = await supabase
    .from("pages")
    .select("id")
    .eq("slug", "home")
    .single();

  if (!page) {
    return NextResponse.json({ error: "Home page record is missing." }, { status: 409 });
  }

  const { error: sectionError } = await supabase
    .from("page_sections")
    .upsert(
      {
        page_id: page.id,
        section_key: "hero",
        heading: heroHeading,
        body: heroBody,
        cta_label: heroCtaLabel,
        cta_url: heroCtaUrl,
        sort_order: 1,
        is_visible: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "page_id,section_key" }
    );

  if (sectionError) {
    return NextResponse.json({ error: sectionError.message }, { status: 400 });
  }

  const { data: settings } = await supabase
    .from("business_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (!settings) {
    return NextResponse.json({ error: "Business settings record is missing." }, { status: 409 });
  }

  const { error: settingsError } = await supabase
    .from("business_settings")
    .update({
      footer_brand_line: footerBrandLine,
      hero_image_url: heroImageUrl || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", settings.id);

  if (settingsError) {
    return NextResponse.json({ error: settingsError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
