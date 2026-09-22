import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { CourseRegistrationForm } from "@/components/CourseRegistrationForm";

export const metadata: Metadata = { title: "Level 1 — AI for Real Work" };

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Level 1 — AI for Real Work"
        title="Stop starting from scratch with AI."
        body="Learn how to give AI clearer work, better context and reusable ways of working — so it becomes useful for real tasks, not just interesting conversations."
        meta="A$150 · Small-group practical course"
        primary="Join Level 1"
        primaryHref="#register"
      />

      <section className="content-section">
        <div className="shell narrow prose">
          <p className="eyebrow">Why Level 1 exists</p>
          <h2>You probably don’t need a better prompt. You need a clearer way of working.</h2>
          <p>
            Many people use AI task by task. The output may sound polished, but it can still miss the point,
            feel generic or need constant rewriting.
          </p>
          <p>
            The problem is often not the model. It is that AI has not been given enough structure to
            understand the work properly.
          </p>
          <aside className="principle">Better AI work starts with better work design.</aside>
        </div>
      </section>

      <section className="content-section alt">
        <div className="shell narrow prose">
          <p className="eyebrow">The Level 1 journey</p>
          <h2>From one-off prompting to a reusable AI assistant.</h2>
          <div className="three-steps">
            <article>
              <span>01</span>
              <h3>Task</h3>
              <p>Define the role, task, context, requirements and output.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Context</h3>
              <p>
                Give AI the background, goal, audience, business information, preferences,
                constraints and examples it would otherwise guess.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Skill Set</h3>
              <p>Turn repeated instructions into a reusable way of working.</p>
            </article>
          </div>
          <aside className="principle">Teach AI how to do ONE job well.</aside>
        </div>
      </section>

      <section className="content-section">
        <div className="shell narrow prose">
          <h2>You’ll work on something real.</h2>
          <p>
            This is not a course where you watch AI demonstrations and go home with a folder of prompts.
            You will use your own work, compare before and after, and stress-test the result.
          </p>
          <h3>Small enough to work on your actual situation.</h3>
          <p>
            Maximum class size: 5 students. The course runs across 3 practical sessions,
            with dates arranged with each cohort.
          </p>
        </div>
      </section>

      <section id="register" className="content-section register-band">
        <div className="shell register-grid">
          <div className="prose">
            <p className="eyebrow">Course details</p>
            <h2>AI for Real Work</h2>
            <p><strong>A$150</strong> · 3 practical sessions · maximum 5 students.</p>
            <p>Session dates are arranged with each cohort.</p>
          </div>
          <CourseRegistrationForm courseSlug="ai-for-real-work" />
        </div>
      </section>
    </>
  );
}