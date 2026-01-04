import Image from "next/image";
import Link from "next/link";
import BackButton from "@/components/BackButton";

export const metadata = {
  title: "Terms & Conditions — LuminNote",
};

export default function TermsPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-10">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/LN.png"
              alt="LuminNote Logo"
              width={36}
              height={36}
              className="rounded-xl"
              priority={false}
            />
            <span className="text-lg font-semibold tracking-tight">LuminNote</span>
          </Link>
          <BackButton ariaLabel="Go back" fallbackHref="/">
            Back
          </BackButton>
        </div>

        <p className="text-[var(--foreground-muted)] mb-2">3️⃣ Terms &amp; Conditions (READY TO USE)</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Terms &amp; Conditions</h1>
        <p className="text-[var(--foreground-muted)] mb-10">Last updated: 4 January 2026</p>

        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-10">
          These Terms &amp; Conditions (“Terms”) govern your use of LuminNote (the “Service”). By creating an account or using the Service, you agree to these Terms.
        </p>

        <h2 className="text-2xl font-semibold tracking-tight mb-4">1. About LuminNote</h2>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-10">
          LuminNote is an AI-powered study and note-taking platform operated by an individual based in the United Kingdom.
        </p>

        <h2 className="text-2xl font-semibold tracking-tight mb-4">2. Eligibility</h2>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-3">
          You may use the Service if:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[var(--foreground-secondary)] mb-6">
          <li>You are legally capable of entering a contract</li>
          <li>You comply with these Terms</li>
        </ul>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-10">
          LuminNote is intended primarily for students but may be used by anyone.
        </p>

        <h2 className="text-2xl font-semibold tracking-tight mb-4">3. Accounts</h2>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-3">
          You are responsible for:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[var(--foreground-secondary)] mb-6">
          <li>Maintaining the security of your account</li>
          <li>All activity under your account</li>
        </ul>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-3">You must not:</p>
        <ul className="list-disc pl-6 space-y-2 text-[var(--foreground-secondary)] mb-10">
          <li>Share accounts</li>
          <li>Use the Service for unlawful purposes</li>
          <li>Attempt to abuse or reverse-engineer the Service</li>
        </ul>

        <h2 className="text-2xl font-semibold tracking-tight mb-4">4. User Content</h2>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-6">
          You retain ownership of all content you upload or create.
        </p>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-10">
          By using the Service, you grant LuminNote a limited, non-exclusive licence to process your content solely to provide the Service.
        </p>

        <h2 className="text-2xl font-semibold tracking-tight mb-4">5. AI-Generated Content Disclaimer</h2>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-6">
          AI-generated content is provided for assistance only.
        </p>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-3">LuminNote:</p>
        <ul className="list-disc pl-6 space-y-2 text-[var(--foreground-secondary)] mb-6">
          <li>Does not guarantee accuracy</li>
          <li>Is not responsible for academic grading, assessment outcomes, or reliance decisions</li>
        </ul>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-10">
          You are responsible for reviewing and verifying all outputs.
        </p>

        <h2 className="text-2xl font-semibold tracking-tight mb-4">6. Subscriptions &amp; Payments</h2>
        <ul className="list-disc pl-6 space-y-2 text-[var(--foreground-secondary)] mb-10">
          <li>Paid plans are billed via Stripe</li>
          <li>Prices are shown clearly before purchase</li>
          <li>Subscriptions renew automatically unless cancelled</li>
          <li>Refunds are not guaranteed and are handled on a case-by-case basis, except where required by law.</li>
        </ul>

        <h2 className="text-2xl font-semibold tracking-tight mb-4">7. Service Availability</h2>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-6">
          We aim for high availability but do not guarantee uninterrupted access.
        </p>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-3">We may:</p>
        <ul className="list-disc pl-6 space-y-2 text-[var(--foreground-secondary)] mb-10">
          <li>Modify features</li>
          <li>Suspend or terminate access for misuse</li>
          <li>Perform maintenance</li>
        </ul>

        <h2 className="text-2xl font-semibold tracking-tight mb-4">8. Termination</h2>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-3">
          We may suspend or terminate your account if you:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[var(--foreground-secondary)] mb-6">
          <li>Violate these Terms</li>
          <li>Abuse the Service</li>
          <li>Engage in harmful or unlawful behaviour</li>
        </ul>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-10">
          You may stop using the Service at any time.
        </p>

        <h2 className="text-2xl font-semibold tracking-tight mb-4">9. Limitation of Liability</h2>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-3">
          To the fullest extent permitted by law:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[var(--foreground-secondary)] mb-10">
          <li>LuminNote is provided “as is”</li>
          <li>We are not liable for indirect or consequential losses</li>
          <li>Our total liability will not exceed the amount paid by you in the previous 12 months</li>
        </ul>

        <h2 className="text-2xl font-semibold tracking-tight mb-4">10. Governing Law</h2>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-10">
          These Terms are governed by the laws of England and Wales.
        </p>

        <h2 className="text-2xl font-semibold tracking-tight mb-4">11. Contact</h2>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-3">
          For questions about these Terms:
        </p>
        <p className="text-[var(--foreground-secondary)] leading-relaxed">
          aziccardi@luminnote.com
        </p>
      </div>
    </div>
  );
}


