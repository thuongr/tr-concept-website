import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { CommunityRegistrationForm } from "@/components/CommunityRegistrationForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "AI Community Sessions" };

type Session = {
  id: string;
  title: string;
  summary: string | null;
  starts_at: string;
};

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  let sessions: Session[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("community_sessions")
      .select("id,title,summary,starts_at")
      .eq("status", "OPEN")
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(3);

    sessions = (data || []) as Session[];
  }

  return (
    <>
      <PageHero
        eyebrow="TRConcept Community"
        title="Practical AI conversations for real work."
        body="Join small online sessions where we explore practical AI ideas, real business questions and the systems behind better AI work. No hype. Come with a question, an idea or simple curiosity."
        primary="See upcoming sessions"
        primaryHref="#upcoming"
      />

      <section className="content-section">
        <div className="shell narrow prose">
          <h2>Sometimes the best next step is a conversation.</h2>
          <div className="definition-grid">
            <article><h3>Real conversations</h3><p>Questions and discussion rather than a one-way sales webinar.</p></article>
            <article><h3>Practical examples</h3><p>See how AI ideas connect to real work and business situations.</p></article>
            <article><h3>New perspectives</h3><p>Learn from people working through similar questions.</p></article>
            <article><h3>A clearer next step</h3><p>Sometimes that means learning more. Sometimes it means doing nothing yet.</p></article>
          </div>
          <p className="meta-line">Community sessions currently have no attendance fee.</p>
        </div>
      </section>

      <section id="upcoming" className="content-section alt">
        <div className="shell narrow">
          <p className="eyebrow">Upcoming sessions</p>

          {sessions.length === 0 ? (
            <div className="empty-state">
              <h2>Next session coming soon.</h2>
              <p>Once a session is opened in Admin, it will appear here automatically.</p>
            </div>
          ) : (
            sessions.map((session) => (
              <article className="event-card" key={session.id}>
                <div className="prose">
                  <h2>{session.title}</h2>
                  <p>{session.summary}</p>
                  <p className="meta-line">
                    {new Date(session.starts_at).toLocaleString("en-AU", {
                      dateStyle: "full",
                      timeStyle: "short",
                      timeZone: "Australia/Brisbane",
                    })}
                    {" · "}Online via Zoom
                  </p>
                </div>
                <CommunityRegistrationForm
                  sessionId={session.id}
                  sessionTitle={session.title}
                />
              </article>
            ))
          )}
        </div>
      </section>

      <section className="content-section">
        <div className="shell narrow prose">
          <h2>You don’t need to be “an AI person”.</h2>
          <p>
            Community Sessions are for small business owners, founders, solo operators,
            admins and professionals who want to understand what actually matters.
          </p>
        </div>
      </section>
    </>
  );
}