import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Mid City Sound Studios terms of service — booking, payment, and studio policies.",
};

export default function Page() {
  return (
    <div className="min-h-screen bg-studio-black py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-4xl text-cream mb-2">Terms of Service</h1>
        <p className="text-mist/60 text-sm mb-10">Last updated: September 2026</p>
        <div className="bg-studio-charcoal border border-studio-border rounded-sm p-8 sm:p-12">
          <p className="text-mist leading-relaxed mb-6">
            By booking studio time, purchasing merch, or otherwise using midcitysound.com, you agree to these terms.
          </p>
          <h2 className="font-display text-2xl text-gold mt-10 mb-3">Studio Booking</h2>
          <p className="text-mist leading-relaxed mb-6">
            Bookings are confirmed once payment or deposit is received through Stripe. Studio time is scheduled subject to engineer availability.
          </p>
          <h2 className="font-display text-2xl text-gold mt-10 mb-3">Cancellation Policy</h2>
          <ul className="list-disc list-inside text-mist leading-relaxed mb-6 space-y-1">
            <li>Cancellations more than 24 hours before a session: full refund</li>
            <li>Cancellations within 24 hours: deposit may be forfeited</li>
            <li>No-shows: session fee is forfeited</li>
          </ul>
          <h2 className="font-display text-2xl text-gold mt-10 mb-3">Merch Orders</h2>
          <p className="text-mist leading-relaxed mb-6">
            Merch is fulfilled through Printify. Please allow standard production and shipping time. Contact us for order issues before disputing a charge.
          </p>
          <h2 className="font-display text-2xl text-gold mt-10 mb-3">Payment</h2>
          <p className="text-mist leading-relaxed mb-6">
            All payments are processed securely through Stripe. We do not store your card information.
          </p>
          <h2 className="font-display text-2xl text-gold mt-10 mb-3">Studio Conduct</h2>
          <p className="text-mist leading-relaxed mb-6">
            Clients are expected to treat studio equipment and staff with respect. Damage caused by client negligence may be billed separately.
          </p>
          <h2 className="font-display text-2xl text-gold mt-10 mb-3">Liability</h2>
          <p className="text-mist leading-relaxed mb-6">
            MCS is not responsible for personal property left at the studio. Session recordings are the property of the paying client unless otherwise agreed in writing.
          </p>
          <h2 className="font-display text-2xl text-gold mt-10 mb-3">Contact Us</h2>
          <p className="text-mist leading-relaxed mb-6">
            Questions about these terms? Email <a href="mailto:studio@midcitysound.com" className="text-gold hover:underline">studio@midcitysound.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
