import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

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
      <Navbar />
      <main className="flex-grow pt-20">{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
