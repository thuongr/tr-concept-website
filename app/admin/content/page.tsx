import { AdminContentSettingsForm } from "@/components/AdminContentSettingsForm";
import { getHomeHeroContent, getBusinessSettings } from "@/lib/site-content";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminContentPage() {
  const { supabase, setupRequired } = await requireAdmin();

  if (setupRequired || !supabase) return null;

  const [hero, settings] = await Promise.all([getHomeHeroContent(), getBusinessSettings()]);

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
          heroHeading={hero.heading}
          heroBody={hero.body}
          heroCtaLabel={hero.ctaLabel}
          heroCtaUrl={hero.ctaUrl}
          footerBrandLine={settings.footerBrandLine}
        />
      </div>
    </section>
  );
}
