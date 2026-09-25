import { createSupabaseServerClient } from "@/lib/supabase/server";

export type HomeHeroContent = {
  heading: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
};

export type BusinessSettings = {
  footerBrandLine: string;
  heroImageUrl: string | null;
};

const fallbackHero: HomeHeroContent = {
  heading: "AI works better with structure.",
  body:
    "TRConcept helps business owners and professionals understand how to structure, design and apply AI in real work — so you can work smarter, build faster and focus on what matters.",
  ctaLabel: "Explore courses",
  ctaUrl: "/learn/level-1",
};

const fallbackSettings: BusinessSettings = {
  footerBrandLine: "Evolve your business through practical AI & digital transformation.",
  heroImageUrl: process.env.NEXT_PUBLIC_HERO_IMAGE_URL || null,
};

export async function getHomeHeroContent(): Promise<HomeHeroContent> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return fallbackHero;

  const { data: page } = await supabase
    .from("pages")
    .select("id")
    .eq("slug", "home")
    .eq("status", "PUBLISHED")
    .maybeSingle();

  if (!page) return fallbackHero;

  const { data: section } = await supabase
    .from("page_sections")
    .select("heading,body,cta_label,cta_url")
    .eq("page_id", page.id)
    .eq("section_key", "hero")
    .eq("is_visible", true)
    .maybeSingle();

  if (!section) return fallbackHero;

  return {
    heading: section.heading || fallbackHero.heading,
    body: section.body || fallbackHero.body,
    ctaLabel: section.cta_label || fallbackHero.ctaLabel,
    ctaUrl: section.cta_url || fallbackHero.ctaUrl,
  };
}

export async function getBusinessSettings(): Promise<BusinessSettings> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return fallbackSettings;

  const { data } = await supabase
    .from("business_settings")
    .select("footer_brand_line,hero_image_url")
    .limit(1)
    .maybeSingle();

  if (!data) return fallbackSettings;

  return {
    footerBrandLine: data.footer_brand_line || fallbackSettings.footerBrandLine,
    heroImageUrl: data.hero_image_url || fallbackSettings.heroImageUrl,
  };
}


export type FeaturedTestimonial = {
  quote: string;
  displayName: string;
  businessName: string | null;
};

export async function getFeaturedTestimonial(): Promise<FeaturedTestimonial | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("testimonials")
    .select("quote,display_name,business_name")
    .eq("status", "PUBLISHED")
    .eq("permission_status", "APPROVED")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  return {
    quote: data.quote,
    displayName: data.display_name,
    businessName: data.business_name || null,
  };
}
