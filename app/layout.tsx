import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageContext";

// Note: fonts are loaded via CSS variables defined in globals.css (Poppins/Inter
// with system fallbacks) rather than next/font/google. next/font downloads the
// font files from Google at build time, which fails in offline/restricted
// environments and takes the whole app down; the CSS-variable approach degrades
// gracefully to locally-installed or system fonts.

export const metadata: Metadata = {
  metadataBase: new URL("https://aflachat.com"), // Placeholder URL, can be changed later
  alternates: {
    canonical: "/",
  },
  title: {
    default: "AflaChat | Access to Verified Aflatoxin Knowledge",
    template: "%s | AflaChat"
  },
  description: "AflaChat is an AI-powered assistant providing access to verified knowledge and information related to aflatoxin contamination.",
  keywords: ["Aflatoxin", "Aflatoxin Prevention", "Verified Knowledge", "AI Assistant", "Agriculture", "Tanzania", "AflaChat", "Smart Farming", "Crop Protection", "Mycotoxin Safety", "Aspergillus flavus", "Safe Storage Practices", "Grain Handling"],
  authors: [{ name: "Casto MALIMALI" }],
  creator: "Casto MALIMALI",
  openGraph: {
    title: "AflaChat | Access to Verified Aflatoxin Knowledge",
    description: "An AI-powered mobile application designed to protect farmers, traders, and consumers by providing instant access to verified aflatoxin knowledge and prevention practices.",
    url: "https://aflachat.com",
    siteName: "AflaChat",
    type: "website",
    locale: "en_US",
    images: [{
      url: "/images/2148761810.jpg",
      width: 1200,
      height: 630,
      alt: "Maize field representing agricultural safety and aflatoxin knowledge",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AflaChat | Access to Verified Aflatoxin Knowledge",
    description: "An AI-powered mobile application designed to provide instant access to verified aflatoxin knowledge.",
    images: ["/images/2148761810.jpg"],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: "AflaChat",
  },
  icons: {
    icon: [
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://aflachat.com/#organization",
  "name": "AflaChat",
  "url": "https://aflachat.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://aflachat.com/images/AflaChatLogo.png",
    "width": 512,
    "height": 512
  },
  "description": "AI-powered agricultural assistant protecting farmers and consumers from aflatoxin contamination."
};

const appSchema = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  "@id": "https://aflachat.com/#application",
  "name": "AflaChat",
  "operatingSystem": "Android",
  "applicationCategory": "BusinessApplication, HealthApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "installUrl": "https://play.google.com/store/apps/details?id=com.app01.aflachat&pcampaignid=web_share",
  "description": "An AI-powered mobile application designed to protect farmers and consumers from Aflatoxin by providing instant agricultural guidance and food safety awareness."
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className="antialiased font-body">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
        />
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
