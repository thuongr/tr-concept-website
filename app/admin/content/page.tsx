import { AdminContentSettingsForm } from "@/components/AdminContentSettingsForm";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminContentPage() {
  const { supabase, setupRequired } = await requireAdmin();

  if (setupRequired || !supabase) return null;

  const { data: page } = await supabase
    .from("pages")
    .select("id")
    .eq("slug", "home")
    .single();

  const { data: hero } = page
    ? await supabase
        .from("page_sections")
        .select("heading,body,cta_label,cta_url")
        .eq("page_id", page.id)
        .eq("section_key", "hero")
        .maybeSingle()
    : { data: null };

  const { data: settings } = await supabase
    .from("business_settings")
    .select("footer_brand_line,hero_image_url")
    .limit(1)
    .maybeSingle();

  return (
    <section className="admin-page">
      <div className="shell admin-two-column">
        <div>
          <p className="eyebrow">Admin · Content</p>
          <h1>Website content</h1>
          <p className="page-lead">
            Edit business content here without opening VS Code. Layout and architecture stay protected.
          </p>
        </div>

        <AdminContentSettingsForm
          heroHeading={hero?.heading || "AI works better with structure."}
          heroBody={
            hero?.body ||
            "TRConcept helps business owners and professionals understand how to structure, design and apply AI in real work — so you can work smarter, build faster and focus on what matters."
          }
          heroCtaLabel={hero?.cta_label || "Explore courses"}
          heroCtaUrl={hero?.cta_url || "/learn/level-1"}
          footerBrandLine={
            settings?.footer_brand_line ||
            "Evolve your business through practical AI & digital transformation."
          }
          heroImageUrl={settings?.hero_image_url || ""}
        />
      </div>
    </section>
  );
}
