import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Mid City Sound Studios privacy policy — how we collect and protect your information.",
};

export default function Page() {
  return (
    <div className="min-h-screen bg-studio-black py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-4xl text-cream mb-2">Privacy Policy</h1>
        <p className="text-mist/60 text-sm mb-10">Last updated: September 2026</p>
        <div className="bg-studio-charcoal border border-studio-border rounded-sm p-8 sm:p-12">
          <p className="text-mist leading-relaxed mb-6">
            Mid City Sound Studios ("MCS," "we," "us") respects your privacy. This policy explains what we collect and how we use it.
          </p>
          <h2 className="font-display text-2xl text-gold mt-10 mb-3">Information We Collect</h2>
          <p className="text-mist leading-relaxed mb-6">
            Name, email, and phone number when you book studio time, submit the contact form, or purchase merch. Payment information is collected and processed securely by Stripe — we never store card details on our servers.
          </p>
          <h2 className="font-display text-2xl text-gold mt-10 mb-3">How We Use Your Information</h2>
          <ul className="list-disc list-inside text-mist leading-relaxed mb-6 space-y-1">
            <li>To schedule and confirm studio bookings</li>
            <li>To process merch orders and payments</li>
            <li>To communicate about your session or order</li>
            <li>To improve our services and site experience</li>
          </ul>
          <h2 className="font-display text-2xl text-gold mt-10 mb-3">Analytics</h2>
          <p className="text-mist leading-relaxed mb-6">
            We use website analytics tools to understand how visitors use our site. These may set cookies in your browser. You can control cookie preferences through your browser settings.
          </p>
          <h2 className="font-display text-2xl text-gold mt-10 mb-3">Information Sharing</h2>
          <p className="text-mist leading-relaxed mb-6">
            We don't sell or trade your information. We share it only with the service providers who help us operate — Stripe (payments), Printify (merch fulfillment) — or when required by law.
          </p>
          <h2 className="font-display text-2xl text-gold mt-10 mb-3">Data Security</h2>
          <p className="text-mist leading-relaxed mb-6">
            Payment data is processed by Stripe and never touches our servers directly. Booking and order data is stored securely and accessible only to authorized staff.
          </p>
          <h2 className="font-display text-2xl text-gold mt-10 mb-3">Your Rights</h2>
          <p className="text-mist leading-relaxed mb-6">
            You can request access to, correction of, or deletion of your personal information by contacting us below.
          </p>
          <h2 className="font-display text-2xl text-gold mt-10 mb-3">Contact Us</h2>
          <p className="text-mist leading-relaxed mb-6">
            Questions? Email <a href="mailto:studio@midcitysound.com" className="text-gold hover:underline">studio@midcitysound.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
