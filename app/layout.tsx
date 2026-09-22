import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: { default: "TRConcept — Practical AI for Real Work", template: "%s | TRConcept" },
  description: "Practical AI education, business transformation and focused digital systems for small businesses and professionals."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><Header/><main>{children}</main><Footer/></body></html>;
}
