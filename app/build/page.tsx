import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Landscape } from "@/components/Landscape";

export const metadata: Metadata = {
  title: "Build — Websites for Your Business",
  description: "Business-first website design and development for small businesses, with enquiries, registrations and practical admin tools scoped to how you work.",
};
const steps = [
  ["BUSINESS", "What are we trying to achieve?"],
  ["CUSTOMER", "Who needs to care?"],
  ["OFFER", "What are we actually offering?"],
  ["MESSAGE", "What must be understood?"],
  ["JOURNEY", "What should happen next?"],
  ["WEBSITE", "What belongs on screen?"],
  ["OPERATIONS", "How will you manage what comes in?"],
];

export default function Page() {
  return <>
    <PageHero eyebrow="Build · Website design & development"
      title={<>A website that works<br className="desktop-break"/> for your business.</>}
      body="TRConcept designs and builds websites for small businesses — from a focused landing page to a website with forms, registrations and a private admin area, depending on how your business works."
      primary="Talk about your website" primaryHref="/contact?type=build"/>
    <section className="content-section">
      <div className="shell prose">
        <div className="visual-section-head"><div><p className="eyebrow">The customer experience. The work behind it.</p><h2>Welcome people in.<br/>Manage what happens next.</h2></div><p>A website should make your offer clear and help you handle the enquiries or registrations it brings in.</p></div>
        <div className="definition-grid">
          <article><h3>Your public website</h3><p>Clear services, useful content and a straightforward path to enquire or register, designed for desktop and mobile.</p></article>
          <article><h3>Your management area</h3><p>Where needed, a private space to review enquiries, manage registrations, update content or track business-specific statuses.</p></article>
          <article><h3>Your connected tools</h3><p>Connect email or an existing business system when it helps. The scope follows your workflow, budget and what you can comfortably maintain.</p></article>
        </div>
        <p>Admin features and integrations are agreed for each project. A simple business may only need a simple website.</p>
      </div>
    </section>
    <section className="content-section build-process">
      <Landscape id="build-process" quiet/>
      <div className="shell prose">
        <div className="visual-section-head"><div><p className="eyebrow">Business first</p><h2>Start with the business behind the website.</h2></div><p>We clarify the offer, customer journey and day-to-day work before deciding what to build.</p></div>
        <div className="build-flow">{steps.map(([label,description],i)=><article key={label}><b>{String(i+1).padStart(2,"0")}</b><strong>{label}</strong><span>{description}</span></article>)}</div>
      </div>
    </section>
    <section className="content-section"><div className="shell narrow prose"><h2>Build what fits. Keep it manageable.</h2><p>Bring your business, your current website if you have one, and the work you want it to support. Together we can define a useful scope. Larger projects are considered selectively; specialist development may involve external partners.</p><Link className="text-link" href="/contact?type=build">Tell us about your website ↗</Link></div></section>
  </>;
}
