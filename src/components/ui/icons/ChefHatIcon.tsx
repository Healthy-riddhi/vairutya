export function ChefHatIcon({
  size = 24,
  strokeWidth = 1.5,
  className = "",
}: {
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6.3 16.2c-2.9 0-5.3-2.3-5.3-5.2s2.4-5.2 5.3-5.2c.35 0 .7.03.95.08C7.95 3.1 9.85 1.8 12 1.8s4.05 1.3 4.72 3.96c.35-.05.6-.08.95-.08 2.9 0 5.3 2.3 5.3 5.2s-2.4 5.2-5.3 5.2" />
      <path d="M6 16c0 0 .7-1.5 2.6-2.8" />
      <path d="M18 16c0 0-.7-1.5-2.6-2.8" />
      <line x1="12" y1="13" x2="12" y2="16" />
      <rect x="6.3" y="16" width="11.4" height="4.2" rx="0.9" />
    </svg>
  );
}
