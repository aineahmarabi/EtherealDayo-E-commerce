import type { Metadata } from "next";
import { CollectionPage } from "@/components/sections/CollectionPage";

export const metadata: Metadata = {
  title: "For Him",
  description: "Ultra-luxury niche fragrances for men — leather, oud, vetiver, wood.",
};

export default function ForHimPage() {
  return (
    <CollectionPage
      label="Collection"
      title="For Him"
      subtitle="Restraint as power. Fragrances for the man who wears silence like a signature."
      accentColor="#8B1A35"
      queryName="listActive"
      audience="him"
      heroImageDesktop="/images/hero/for_him_desktop.png"
      heroImageMobile="/images/hero/for_him_mobile.png"
    />
  );
}
