import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Ethereal Dayo",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-ink pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-text hover:text-bone transition-colors font-body mb-10">
          <ArrowLeft size={14} /> Back
        </Link>
        
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <span className="text-[11px] tracking-[0.3em] uppercase text-gold font-body">Data & Security</span>
            <h1 className="font-display text-4xl md:text-5xl text-bone tracking-tight">Privacy Policy</h1>
          </div>

          <div className="flex flex-col gap-8 text-muted-text font-body text-base leading-relaxed">
            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-display text-bone tracking-wide">1. Introduction</h2>
              <p>At Ethereal Dayo, we believe that discretion is the ultimate luxury. This Privacy Policy details how we collect, utilize, and fiercely protect your personal information when you visit our Maison or make a purchase from etherealdayo.com.</p>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-display text-bone tracking-wide">2. Information We Collect</h2>
              <p>When you place an order, we collect only the necessary details to fulfill your purchase and provide an exceptional client experience: your name, billing address, shipping address, payment details (processed securely via Stripe), email address, and phone number.</p>
              <p>Additionally, as you browse our digital boutique, we automatically collect specific information about your device, web browser, IP address, and how you interact with our collections, using cookies and similar secure technologies to refine your experience.</p>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-display text-bone tracking-wide">3. How We Use Your Information</h2>
              <p>Your information is used strictly to process transactions, arrange shipping, and provide you with invoices and order confirmations. With your explicit consent, we may use your email to send exclusive dispatches regarding new rare arrivals, private sales, and Maison updates.</p>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-display text-bone tracking-wide">4. Data Security & Sharing</h2>
              <p>Ethereal Dayo employs state-of-the-art encryption protocols. We do not sell, rent, or trade your personal information. We only share data with trusted third parties (such as courier services and our payment processor, Stripe) solely for the purpose of fulfilling your order and operating our boutique.</p>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-display text-bone tracking-wide">5. Your Rights</h2>
              <p>You reserve the right to request access to the personal data we hold about you, or to ask that your personal information be corrected, updated, or permanently erased from our archives. To exercise this right, please contact our concierge.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
