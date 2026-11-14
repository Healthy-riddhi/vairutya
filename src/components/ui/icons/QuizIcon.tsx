export function QuizIcon({
  size = 24,
  strokeWidth = 1.3,
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
      <rect x="4.5" y="2.5" width="11.5" height="19" rx="2" />
      <text
        x="6.5"
        y="7.7"
        fontSize="3.6"
        fontWeight="700"
        stroke="none"
        fill="currentColor"
        fontFamily="Georgia, serif"
      >
        Q
      </text>
      <line x1="10.8" y1="6.3" x2="14" y2="6.3" strokeWidth="1.1" />
      <text
        x="6.5"
        y="13.3"
        fontSize="3.6"
        fontWeight="700"
        stroke="none"
        fill="currentColor"
        fontFamily="Georgia, serif"
      >
        A
      </text>
      <line x1="9.6" y1="10.7" x2="13.8" y2="10.7" strokeWidth="0.85" />
      <line x1="9.6" y1="12.1" x2="13.8" y2="12.1" strokeWidth="0.85" />
      <line x1="6.5" y1="14.1" x2="11.8" y2="14.1" strokeWidth="0.85" />
      <line x1="6.5" y1="15.5" x2="10.3" y2="15.5" strokeWidth="0.85" />
      <path
        d="M13.7 16.8l5.3-5.3a1.1 1.1 0 0 1 1.6 1.6l-5.3 5.3-2 .4z"
        strokeWidth="1.15"
      />
    </svg>
  );
}
