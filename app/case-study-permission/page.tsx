import type { Metadata } from "next";
import { CaseStudyPermissionForm } from "@/components/CaseStudyPermissionForm";

export const metadata: Metadata = { title: "Case Study & Media Permission" };

export default function Page() {
  return (
    <section className="page-hero">
      <div className="shell narrow">
        <p className="eyebrow">Permission</p>
        <h1>Choose exactly what TRConcept may use.</h1>
        <p className="page-lead">
          This form records specific permission for testimonials, case studies, photos,
          business information and media. You can choose the scope rather than giving one blanket approval.
        </p>

        <CaseStudyPermissionForm />
      </div>
    </section>
  );
}
