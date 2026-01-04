import Image from "next/image";
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/images/LN.png"
              alt="LuminNote Logo"
              width={32}
              height={32}
              className="rounded-lg"
              priority={false}
            />
            <span className="text-lg font-semibold">LuminNote</span>
          </Link>

          <nav aria-label="Footer" className="flex items-center gap-8">
            <Link
              href="/privacy"
              className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors text-sm"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors text-sm"
            >
              Terms &amp; Conditions
            </Link>
          </nav>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--border)] text-center">
          <p className="text-[var(--foreground-muted)] text-sm">
            © {new Date().getFullYear()} LuminNote. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}


