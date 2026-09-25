import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://trconcept.co";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TRConcept — Practical AI for Real Work",
    template: "%s | TRConcept",
  },
  description:
    "Practical AI education, business transformation and focused digital systems for small businesses and professionals.",
  openGraph: {
    type: "website",
    siteName: "TRConcept",
    title: "TRConcept — Practical AI for Real Work",
    description:
      "Learn the structure. Design what fits. Build what matters.",
    url: siteUrl,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
