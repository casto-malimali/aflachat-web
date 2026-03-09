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
  title: "AflaChat | AI-Powered Aflatoxin Protection",
  description: "AflaChat is an AI-powered assistant that provides information and answers related to aflatoxin contamination, food safety, and agricultural practices.",
  keywords: ["Aflatoxin", "Food Safety", "AI Assistant", "Agriculture", "Tanzania", "AflaChat", "Smart Farming"],
  openGraph: {
    title: "AflaChat | AI-Powered Aflatoxin Protection",
    description: "An AI powered mobile application that provides information and answers related to Aflatoxin.",
    type: "website",
    locale: "en_US",
  },
  icons: {
    icon: "/images/aflachat_logo.png",
    apple: "/images/aflachat_logo.png",
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
