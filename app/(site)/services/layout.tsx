import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description: "Explore AflaChat services including AI-driven Aflatoxin information, food safety education, smart farming guidance, and 24/7 interactive chat.",
  openGraph: {
    title: "Services | AflaChat",
    description: "Explore AflaChat services including AI-driven Aflatoxin information, food safety education, smart farming guidance, and 24/7 interactive chat.",
  }
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
