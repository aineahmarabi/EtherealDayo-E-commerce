import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Returns & Exchanges | Ethereal Dayo",
};

export default function ReturnsPage() {
  return (
    <div className="min-h-dvh bg-ink pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-text hover:text-bone transition-colors font-body mb-10">
          <ArrowLeft size={14} /> Back
        </Link>
        
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <span className="text-[11px] tracking-[0.3em] uppercase text-gold font-body">Guarantees</span>
            <h1 className="font-display text-4xl md:text-5xl text-bone tracking-tight">Returns & Exchanges</h1>
          </div>

          <div className="flex flex-col gap-8 text-muted-text font-body text-base leading-relaxed">
            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-display text-bone tracking-wide">1. Our Commitment to Quality</h2>
              <p>At Ethereal Dayo, we guarantee the authenticity and pristine condition of every fragrance we curate. If you receive an item that is damaged during transit or possesses a verified manufacturer defect, we will gladly arrange a replacement or issue a full refund within 14 days of delivery.</p>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-display text-bone tracking-wide">2. The 14-Day Return Window</h2>
              <p>Due to the intimate and delicate nature of luxury fragrances, we can only accept returns for items that remain entirely sealed in their original cellophane wrapping and packaging. Once a fragrance has been unsealed or sprayed, it is considered final sale and cannot be returned or exchanged under any circumstances.</p>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-display text-bone tracking-wide">3. Initiating a Return</h2>
              <p>To initiate a return or exchange for a sealed or damaged item, please contact our concierge team at <strong>concierge@etherealdayo.com</strong> with your order number and photographic evidence (if applicable). Our team will provide you with a return authorization and specific instructions.</p>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-display text-bone tracking-wide">4. Refunds</h2>
              <p>Approved refunds will be processed back to your original method of payment within 5-7 business days of our atelier receiving and inspecting the returned item. Please note that original shipping fees are non-refundable.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
