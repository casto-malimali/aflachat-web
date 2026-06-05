import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/chat/ChatWidget";

// Marketing-site chrome (navbar/footer/chat widget). Lives in the (site) route
// group so the /admin dashboard can use a completely separate shell. The route
// group is parentheses-only, so public URLs ( /, /contact, ... ) are unchanged.
export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="flex-grow pt-20">{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
