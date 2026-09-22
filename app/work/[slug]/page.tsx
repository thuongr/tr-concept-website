import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { title: "Case Study" };

  const { data } = await supabase
    .from("case_studies")
    .select("title")
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .eq("permission_status", "APPROVED")
    .maybeSingle();

  return { title: data?.title || "Case Study" };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  if (!supabase) notFound();

  const { data } = await supabase!
    .from("case_studies")
    .select("type,title,subject_name,business_name,challenge,diagnosis,approach,what_we_built,what_we_did_not_build,outcome,quote")
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .eq("permission_status", "APPROVED")
    .maybeSingle();

  if (!data) notFound();

  return (
    <article className="page-hero">
      <div className="shell narrow prose">
        <p className="eyebrow">{data.type} case study</p>
        <h1>{data.title}</h1>
        {(data.subject_name || data.business_name) && (
          <p className="meta-line">
            {[data.subject_name, data.business_name].filter(Boolean).join(" · ")}
          </p>
        )}

        {data.challenge && <><h2>Situation</h2><p>{data.challenge}</p></>}
        {data.diagnosis && <><h2>Diagnosis</h2><p>{data.diagnosis}</p></>}
        {data.approach && <><h2>Approach</h2><p>{data.approach}</p></>}
        {data.what_we_built && <><h2>What we built</h2><p>{data.what_we_built}</p></>}
        {data.what_we_did_not_build && <><h2>What we deliberately did not build</h2><p>{data.what_we_did_not_build}</p></>}
        {data.outcome && <><h2>Outcome</h2><p>{data.outcome}</p></>}
        {data.quote && <blockquote className="story-quote">“{data.quote}”</blockquote>}
      </div>
    </article>
  );
}
