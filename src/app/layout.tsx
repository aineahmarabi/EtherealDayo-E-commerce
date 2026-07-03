import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { PageTracker } from "@/components/layout/PageTracker";

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Ethereal Dayo — Maison de Parfum",
    template: "%s | Ethereal Dayo",
  },
  description:
    "Ultra-luxury niche fragrances from the world's most singular perfumers. Discover For Her, For Him, and beyond.",
  keywords: ["niche perfume", "luxury fragrance", "Ethereal Dayo", "oud", "rose", "leather"],
  openGraph: {
    siteName: "Ethereal Dayo",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${jost.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-ink text-bone font-body antialiased">
        <ConvexClientProvider>
          <PageTracker />
          <Navbar />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
          <SearchOverlay />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
