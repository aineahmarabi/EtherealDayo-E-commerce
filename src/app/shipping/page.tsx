import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping Policy | Ethereal Dayo",
};

export default function ShippingPage() {
  return (
    <div className="min-h-dvh bg-ink pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-text hover:text-bone transition-colors font-body mb-10">
          <ArrowLeft size={14} /> Back
        </Link>
        
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <span className="text-[11px] tracking-[0.3em] uppercase text-gold font-body">Logistics</span>
            <h1 className="font-display text-4xl md:text-5xl text-bone tracking-tight">Shipping Policy</h1>
          </div>

          <div className="flex flex-col gap-8 text-muted-text font-body text-base leading-relaxed">
            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-display text-bone tracking-wide">1. The Dispatch Process</h2>
              <p>At Ethereal Dayo, every order is treated with the utmost care and precision. Once your order is placed, please allow 1 to 2 business days for our atelier to prepare, hand-package, and dispatch your fragrance. You will receive a confirmation email containing your tracking details the moment your package is handed over to our courier partners.</p>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-display text-bone tracking-wide">2. Delivery Zones & Times</h2>
              <p>We proudly offer domestic delivery within Kenya and select international shipping. </p>
              <ul className="list-disc pl-5 flex flex-col gap-2">
                <li><strong className="text-bone/80">Nairobi CBD & Environs:</strong> Same-day or next-day delivery for orders placed before 12:00 PM (EAT).</li>
                <li><strong className="text-bone/80">Rest of Kenya:</strong> 2 to 3 business days via our premium local couriers.</li>
                <li><strong className="text-bone/80">International Orders:</strong> 5 to 10 business days. Please note that fragrances are classified as dangerous goods (due to alcohol content) and require specialized shipping, which may occasionally result in slight delays at customs.</li>
              </ul>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-display text-bone tracking-wide">3. Shipping Rates</h2>
              <p>Shipping rates are calculated dynamically at checkout based on your delivery address and the total volumetric weight of your order. We offer a complimentary Pick-Up option at our Nairobi atelier for local clients.</p>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-display text-bone tracking-wide">4. Taxes & Duties</h2>
              <p>For international shipments, your order may be subject to import duties and taxes, which are incurred once a shipment reaches your destination country. Ethereal Dayo is not responsible for these charges if they are applied and are your responsibility as the customer.</p>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-display text-bone tracking-wide">5. Packaging</h2>
              <p>True luxury lies in the details. Every bottle is secured in our signature Ethereal Dayo protective casing, ensuring it arrives at your doorstep in immaculate condition, shielded from temperature fluctuations and physical impact during transit.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
