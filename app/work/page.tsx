import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Work & Stories" };

type CaseStudy = {
  id: string;
  type: string;
  title: string;
  slug: string;
  challenge: string | null;
  outcome: string | null;
};

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  let studies: CaseStudy[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("case_studies")
      .select("id,type,title,slug,challenge,outcome")
      .eq("status", "PUBLISHED")
      .eq("permission_status", "APPROVED")
      .order("created_at", { ascending: false });

    studies = (data || []) as CaseStudy[];
  }

  return (
    <>
      <PageHero
        eyebrow="Real work"
        title="What happens when the structure becomes clearer?"
        body="Student learning, community builds and selected business projects — showing the thinking behind the work, not just the polished result."
      />

      <section className="content-section">
        <div className="shell narrow">
          <div className="definition-grid">
            <article>
              <p className="eyebrow">Student stories</p>
              <h3>Learning that changes the work.</h3>
              <p>How people moved from fragmented prompting to clearer, reusable AI work.</p>
            </article>
            <article>
              <p className="eyebrow">Community builds</p>
              <h3>Useful projects, built for real needs.</h3>
              <p>Selected community and micro-business work, published with permission.</p>
            </article>
            <article>
              <p className="eyebrow">Client projects</p>
              <h3>Business decisions before digital output.</h3>
              <p>Landing pages, consulting and selected systems.</p>
            </article>
          </div>

          {studies.length > 0 ? (
            <div className="case-study-grid">
              {studies.map((study) => (
                <article className="case-study-card" key={study.id}>
                  <p className="eyebrow">{study.type}</p>
                  <h2>{study.title}</h2>
                  <p>{study.outcome || study.challenge || "Read the story behind the work."}</p>
                  <Link className="text-link" href={`/work/${study.slug}`}>
                    Read the story →
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h2>Approved stories are being prepared.</h2>
              <p>
                TRConcept will only publish identifiable student, client or community proof
                after permission is recorded.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
