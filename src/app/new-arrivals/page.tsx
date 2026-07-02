import type { Metadata } from "next";
import { CollectionPage } from "@/components/sections/CollectionPage";

export const metadata: Metadata = {
  title: "New Arrivals",
  description: "Recently introduced fragrances from the world's finest niche perfume houses.",
};

export default function NewArrivalsPage() {
  return (
    <CollectionPage
      label="New"
      title="New Arrivals"
      subtitle="The newest additions to the atelier — still warm from the perfumer's studio."
      accentColor="#A86C9E"
      queryName="listNewArrivals"
      heroImageDesktop="/images/hero/new_arrivals_desktop.jpg"
      heroImageMobile="/images/hero/new_arrivals_mobile.jpg"
    />
  );
}
