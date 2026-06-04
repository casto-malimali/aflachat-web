import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the AflaChat team. We provide 24/7 support for aflatoxin-related inquiries, app support, and general questions via email.",
  openGraph: {
    title: "Contact Us | AflaChat",
    description: "Get in touch with the AflaChat team. We provide 24/7 support for aflatoxin-related inquiries, app support, and general questions via email.",
  }
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
