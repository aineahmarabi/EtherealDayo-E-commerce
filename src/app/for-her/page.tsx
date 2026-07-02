import type { Metadata } from "next";
import { CollectionPage } from "@/components/sections/CollectionPage";

export const metadata: Metadata = {
  title: "For Her",
  description: "Ultra-luxury niche fragrances for women — rose, iris, musks, and beyond.",
};

export default function ForHerPage() {
  return (
    <CollectionPage
      label="Collection"
      title="For Her"
      subtitle="Feminine without apology. These are the fragrances that linger in doorways."
      accentColor="#C97B89"
      queryName="listActive"
      audience="her"
      heroImageDesktop="/images/hero/for_her_desktop.png"
      heroImageMobile="/images/hero/for_her_mobile.png"
    />
  );
}
