import type { Metadata } from "next";
import { CollectionPage } from "@/components/sections/CollectionPage";

export const metadata: Metadata = {
  title: "Bestsellers",
  description: "The fragrances that have earned a permanent place on dressing tables worldwide.",
};

export default function BestsellersPage() {
  return (
    <CollectionPage
      label="Most Loved"
      title="Bestsellers"
      subtitle="These fragrances speak for themselves. The ones that always get asked about."
      accentColor="#C9A961"
      queryName="listBestsellers"
      heroImageDesktop="/images/hero/best_sellers_desktop.jpg"
      heroImageMobile="/images/hero/best_sellers_mobile.jpg"
    />
  );
}
