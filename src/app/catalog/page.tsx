import type { Metadata } from "next";
import { CollectionPage } from "@/components/sections/CollectionPage";

export const metadata: Metadata = {
  title: "Full Catalog",
  description: "Every fragrance in the Ethereal Dayo collection, curated without compromise.",
};

export default function CatalogPage() {
  return (
    <CollectionPage
      label="The Full House"
      title="All Fragrances"
      subtitle="Every bottle we carry. Curated without compromise, presented without apology."
      accentColor="#C9A961"
      queryName="listActive"
      heroImageDesktop="/images/hero/catalog_desktop.png"
      heroImageMobile="/images/hero/catalog_mobile.png"
    />
  );
}
