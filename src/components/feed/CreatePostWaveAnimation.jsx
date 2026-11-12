"use client";

export default function CreatePostWaveAnimation() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl opacity-70"
    >
      <svg
        viewBox="0 0 600 120"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="create-post-wave-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.08" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        <path
          d="M0 58 C75 42 125 42 200 58 S325 74 400 58 S525 42 600 58 V120 H0 Z"
          fill="url(#create-post-wave-fill)"
          className="text-primary"
        >
          <animate
            attributeName="d"
            dur="7s"
            repeatCount="indefinite"
            values="M0 58 C75 42 125 42 200 58 S325 74 400 58 S525 42 600 58 V120 H0 Z;M0 58 C75 74 125 74 200 58 S325 42 400 58 S525 74 600 58 V120 H0 Z;M0 58 C75 42 125 42 200 58 S325 74 400 58 S525 42 600 58 V120 H0 Z"
          />
        </path>

        <path
          d="M0 60 C80 48 120 48 200 60 S320 72 400 60 S520 48 600 60"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.12"
          strokeWidth="2"
          className="text-primary"
        >
          <animate
            attributeName="d"
            dur="8s"
            repeatCount="indefinite"
            values="M0 60 C80 48 120 48 200 60 S320 72 400 60 S520 48 600 60;M0 60 C80 72 120 72 200 60 S320 48 400 60 S520 72 600 60;M0 60 C80 48 120 48 200 60 S320 72 400 60 S520 48 600 60"
          />
        </path>

        <path
          d="M0 63 C75 55 125 55 200 63 S325 71 400 63 S525 55 600 63"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.08"
          strokeWidth="1.5"
          className="text-primary"
        >
          <animate
            attributeName="d"
            dur="10s"
            repeatCount="indefinite"
            values="M0 63 C75 55 125 55 200 63 S325 71 400 63 S525 55 600 63;M0 63 C75 71 125 71 200 63 S325 55 400 63 S525 71 600 63;M0 63 C75 55 125 55 200 63 S325 71 400 63 S525 55 600 63"
          />
        </path>
      </svg>
    </div>
  );
}
