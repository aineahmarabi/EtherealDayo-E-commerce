import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Ethereal Dayo",
};

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-ink pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-text hover:text-bone transition-colors font-body mb-10">
          <ArrowLeft size={14} /> Back
        </Link>
        
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <span className="text-[11px] tracking-[0.3em] uppercase text-gold font-body">Legal</span>
            <h1 className="font-display text-4xl md:text-5xl text-bone tracking-tight">Terms of Service</h1>
          </div>

          <div className="flex flex-col gap-8 text-muted-text font-body text-base leading-relaxed">
            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-display text-bone tracking-wide">1. Acceptance of Terms</h2>
              <p>Welcome to Ethereal Dayo. By accessing, browsing, or purchasing from our website, you agree to be bound by the following Terms of Service. Please read them carefully before engaging with our Maison.</p>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-display text-bone tracking-wide">2. Products & Pricing</h2>
              <p>We make every effort to display the colors, descriptions, and details of our luxury fragrances as accurately as possible. However, the perception of scent is inherently subjective. All prices are listed in Kenyan Shillings (KES) unless otherwise noted, and are subject to change without prior notice. We reserve the right to modify or discontinue any product at our discretion.</p>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-display text-bone tracking-wide">3. Order Refusal & Limitations</h2>
              <p>We reserve the right to refuse any order placed with us. In our sole discretion, we may limit or cancel quantities purchased per person, per household, or per order. This includes orders placed by or under the same customer account, credit card, and/or billing or shipping address, particularly if we suspect fraudulent activity or unauthorized reselling.</p>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-display text-bone tracking-wide">4. Intellectual Property</h2>
              <p>All content on this site, including but not limited to typography, imagery, logos, text, and design motifs, is the exclusive property of Ethereal Dayo. No material from our boutique may be copied, reproduced, republished, or distributed without our explicit written permission.</p>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-display text-bone tracking-wide">5. Limitation of Liability</h2>
              <p>Ethereal Dayo, our directors, and our partners shall not be liable for any direct, indirect, incidental, punitive, or consequential damages arising from your use of our services or products. We do not guarantee that the use of our service will be uninterrupted, timely, secure, or error-free.</p>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-display text-bone tracking-wide">6. Governing Law</h2>
              <p>These Terms of Service and any separate agreements whereby we provide you services shall be governed by and construed in accordance with the laws of the Republic of Kenya.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
