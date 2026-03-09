import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageContext";
import { ThemeProvider } from "@/components/ThemeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aflachat.com"), // Placeholder URL, can be changed later
  title: {
    default: "AflaChat | AI-Powered Aflatoxin Protection",
    template: "%s | AflaChat"
  },
  description: "AflaChat is an AI-powered assistant that provides information and answers related to aflatoxin contamination, food safety, and agricultural practices.",
  keywords: ["Aflatoxin", "Food Safety", "AI Assistant", "Agriculture", "Tanzania", "AflaChat", "Smart Farming", "Crop Protection"],
  authors: [{ name: "Casto MALIMALI" }],
  creator: "Casto MALIMALI",
  openGraph: {
    title: "AflaChat | AI-Powered Aflatoxin Protection",
    description: "An AI-powered mobile application designed to protect farmers and consumers from Aflatoxin by providing instant agricultural guidance and food safety awareness.",
    url: "https://aflachat.com",
    siteName: "AflaChat",
    type: "website",
    locale: "en_US",
    images: [{
      url: "/images/2148761810.jpg",
      width: 1200,
      height: 630,
      alt: "Maize field representing agricultural safety",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AflaChat | AI-Powered Aflatoxin Protection",
    description: "An AI-powered mobile application designed to protect farmers and consumers from Aflatoxin.",
    images: ["/images/2148761810.jpg"],
  },
  icons: {
    icon: "/images/AflaChatLogo.png",
    apple: "/images/AflaChatLogo.png",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${poppins.variable} ${inter.variable} antialiased`}
        style={{ fontFamily: "var(--font-inter, Inter, system-ui, sans-serif)" }}
      >
        <LanguageProvider>
          <ThemeProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow pt-20">
                {children}
              </main>
              <Footer />
            </div>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
