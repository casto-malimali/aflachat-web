import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Download App",
  description: "Download the AflaChat app for free and get instant, AI-powered protection against Aflatoxin directly on your Android mobile device.",
  openGraph: {
    title: "Download App | AflaChat",
    description: "Download the AflaChat app for free and get instant, AI-powered protection against Aflatoxin directly on your Android mobile device.",
  }
};

export default function DownloadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
