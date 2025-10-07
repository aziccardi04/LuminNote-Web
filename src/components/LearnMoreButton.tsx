'use client';

interface LearnMoreButtonProps {
  className?: string;
}

export default function LearnMoreButton({ className }: LearnMoreButtonProps) {
  const handleClick = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <button
      onClick={handleClick}
      className={className}
    >
      Learn More
    </button>
  );
}