"use client";

import dynamic from "next/dynamic";

const DotLottieReact = dynamic(
  () =>
    import("@lottiefiles/dotlottie-react").then(
      (module) => module.DotLottieReact,
    ),
  { ssr: false },
);

export default function DotLottieAnimation({ src, className = "", ...props }) {
  return (
    <div className={`relative h-full min-h-[240px] w-full ${className}`}>
      <DotLottieReact
        src={src}
        loop
        autoplay
        {...props}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
