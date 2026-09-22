import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { CourseRegistrationForm } from "@/components/CourseRegistrationForm";

export const metadata: Metadata = { title: "Level 2 — AI for Business Builder" };

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Level 2 — AI for Business Builder"
        title="Move from using AI to designing how AI fits your business."
        body="Step back from individual prompts and assistants to understand the bigger system — what AI should know, how it should behave, which capabilities matter, where workflows connect and what should remain human."
        meta="A$450 · Small-group business architecture course"
        primary="Join Level 2"
        primaryHref="#register"
      />

      <section className="content-section">
        <div className="shell narrow prose">
          <p className="eyebrow">From assistant to business system</p>
          <h2>One good AI assistant is useful. A business needs a bigger picture.</h2>
          <p>
            Level 1 helps you teach AI how to do one job well. Level 2 asks a different question:
            <strong> How should AI work across MY business?</strong>
          </p>
          <p>
            The objective is not to add more AI everywhere. It is to decide what AI needs to know,
            how it should behave, how work should move and where humans should remain involved.
          </p>
        </div>
      </section>

      <section className="content-section alt">
        <div className="shell narrow prose">
          <p className="eyebrow">The architecture</p>
          <h2>A practical architecture for AI-enabled business.</h2>
          <div className="architecture-line">
            BUSINESS → BRAIN → HEART → SKILLS → AGENTS → WORKFLOW → CONNECTIONS → AUTOMATION
          </div>
          <div className="definition-grid">
            <article><h3>Brain</h3><p>What AI needs to know.</p></article>
            <article><h3>Heart</h3><p>How AI should think and behave.</p></article>
            <article><h3>Skills</h3><p>Reusable methods for recurring jobs.</p></article>
            <article><h3>Agents</h3><p>Who owns a responsibility — only when ownership actually matters.</p></article>
            <article><h3>Workflow</h3><p>How work moves between people, AI and tools.</p></article>
            <article><h3>Automation</h3><p>What is worth repeating without repeated manual effort.</p></article>
          </div>
          <aside className="principle">
            The goal is the minimum sufficient system for the business outcome.
          </aside>
        </div>
      </section>

      <section className="content-section">
        <div className="shell narrow prose">
          <h2>Better judgement before more technology.</h2>
          <p>
            Level 2 runs across 9 CORE sessions with a maximum of 5 students.
            Dates are arranged with each cohort.
          </p>
          <h3>Autonomy is a design decision.</h3>
          <p>Human only → AI assisted → AI executes + human approves → automated → agentic.</p>
        </div>
      </section>

      <section id="register" className="content-section register-band">
        <div className="shell register-grid">
          <div className="prose">
            <p className="eyebrow">Course details</p>
            <h2>AI for Business Builder</h2>
            <p><strong>A$450</strong> · 9 CORE sessions · maximum 5 students.</p>
            <p>Session dates are arranged with each cohort.</p>
          </div>
          <CourseRegistrationForm courseSlug="ai-for-business-builder" />
        </div>
      </section>
    </>
  );
}