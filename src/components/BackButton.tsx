'use client';

import { useRouter } from "next/navigation";

interface BackButtonProps {
  className?: string;
  fallbackHref?: string;
  children?: React.ReactNode;
  ariaLabel?: string;
}

export default function BackButton({
  className = "btn-secondary text-sm px-4 py-2",
  fallbackHref = "/",
  children = "Back",
  ariaLabel = "Go back",
}: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={className}
      aria-label={ariaLabel}
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
          return;
        }
        router.push(fallbackHref);
      }}
    >
      {children}
    </button>
  );
}


