import Image from "next/image";
import Link from "next/link";
import BackButton from "@/components/BackButton";

export const metadata = {
  title: "Privacy Policy — LuminNote",
};

export default function PrivacyPage() {
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

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-[var(--foreground-muted)] mb-10">Last updated: 4 January 2026</p>

        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-6">
          LuminNote (“we”, “us”, or “our”) respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and protect your information when you use the LuminNote website and application (the “Service”).
        </p>

        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-10">
          LuminNote is currently operated by an individual based in the United Kingdom.
        </p>

        <h2 className="text-2xl font-semibold tracking-tight mb-4">1. Information We Collect</h2>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-6">
          We may collect and process the following types of information:
        </p>

        <h3 className="text-xl font-semibold tracking-tight mb-3">a) Account Information</h3>
        <ul className="list-disc pl-6 space-y-2 text-[var(--foreground-secondary)] mb-6">
          <li>Email address</li>
          <li>Authentication identifiers (managed securely via Supabase)</li>
        </ul>

        <h3 className="text-xl font-semibold tracking-tight mb-3">b) User Content</h3>
        <ul className="list-disc pl-6 space-y-2 text-[var(--foreground-secondary)] mb-4">
          <li>Notes you create</li>
          <li>Files you upload (e.g. lecture PDFs, slides)</li>
          <li>AI-generated content derived from your inputs</li>
        </ul>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-6">
          We do not claim ownership of your content.
        </p>

        <h3 className="text-xl font-semibold tracking-tight mb-3">c) Payment Information</h3>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-3">
          Payments are processed securely by Stripe.
        </p>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-3">
          We do not store your card details.
        </p>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-3">Stripe may collect:</p>
        <ul className="list-disc pl-6 space-y-2 text-[var(--foreground-secondary)] mb-6">
          <li>Billing information</li>
          <li>Payment method details</li>
          <li>Transaction history</li>
        </ul>

        <h3 className="text-xl font-semibold tracking-tight mb-3">d) Usage Data</h3>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-3">
          We may collect limited usage data to improve the Service, such as:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[var(--foreground-secondary)] mb-10">
          <li>Feature usage (e.g. lecture uploads, note creation)</li>
          <li>Error logs</li>
        </ul>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-10">
          This data is collected in an aggregated and anonymised form where possible.
        </p>

        <h2 className="text-2xl font-semibold tracking-tight mb-4">2. How We Use Your Information</h2>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-3">
          We use your information to:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[var(--foreground-secondary)] mb-10">
          <li>Provide and operate the Service</li>
          <li>Authenticate users</li>
          <li>Process payments</li>
          <li>Generate AI-assisted content</li>
          <li>Improve performance and reliability</li>
          <li>Communicate important service-related messages</li>
        </ul>

        <h2 className="text-2xl font-semibold tracking-tight mb-4">3. AI &amp; Automated Processing</h2>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-3">
          LuminNote uses AI models to assist with:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[var(--foreground-secondary)] mb-6">
          <li>Note generation</li>
          <li>Summaries</li>
          <li>Academic support features</li>
        </ul>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-3">
          Your content may be sent securely to third-party AI providers solely to deliver these features.
        </p>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-10">
          We do not use your content to train public AI models.
        </p>

        <h2 className="text-2xl font-semibold tracking-tight mb-4">4. Third-Party Services</h2>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-3">
          We rely on trusted third-party providers, including:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[var(--foreground-secondary)] mb-6">
          <li>Supabase – authentication, database, file storage</li>
          <li>OpenAI – AI processing</li>
          <li>Stripe – payments</li>
          <li>Resend – transactional emails</li>
          <li>Vercel – hosting and infrastructure</li>
        </ul>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-10">
          Each provider is GDPR-compliant and processes data only under strict agreements.
        </p>

        <h2 className="text-2xl font-semibold tracking-tight mb-4">5. Data Storage &amp; Security</h2>
        <ul className="list-disc pl-6 space-y-2 text-[var(--foreground-secondary)] mb-10">
          <li>Data is stored on secure servers within the EU or UK where possible</li>
          <li>We use industry-standard security measures</li>
          <li>No system is 100% secure, but we take reasonable steps to protect your data</li>
        </ul>

        <h2 className="text-2xl font-semibold tracking-tight mb-4">6. Data Retention</h2>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-3">
          We retain your data only for as long as necessary to:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[var(--foreground-secondary)] mb-6">
          <li>Provide the Service</li>
          <li>Meet legal obligations</li>
        </ul>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-10">
          You may delete your account at any time.
        </p>

        <h2 className="text-2xl font-semibold tracking-tight mb-4">7. Your Rights (UK &amp; EU Users)</h2>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-3">
          You have the right to:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[var(--foreground-secondary)] mb-6">
          <li>Access your data</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Object to processing</li>
          <li>Request data portability</li>
        </ul>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-3">
          To exercise these rights, contact us at:
        </p>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-10">
          support@luminnote.com
        </p>

        <h2 className="text-2xl font-semibold tracking-tight mb-4">8. Children</h2>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-3">
          LuminNote is not directed at children under 13.
        </p>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-10">
          Users under 18 should only use the Service with appropriate consent.
        </p>

        <h2 className="text-2xl font-semibold tracking-tight mb-4">9. Changes to This Policy</h2>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-3">
          We may update this Privacy Policy from time to time.
        </p>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-10">
          Material changes will be communicated via the Service.
        </p>

        <h2 className="text-2xl font-semibold tracking-tight mb-4">10. Contact</h2>
        <p className="text-[var(--foreground-secondary)] leading-relaxed mb-3">
          If you have questions about this Privacy Policy, contact:
        </p>
        <p className="text-[var(--foreground-secondary)] leading-relaxed">
          aziccardi@luminnote.com
        </p>
      </div>
    </div>
  );
}


