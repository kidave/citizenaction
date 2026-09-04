"use client";

import Lottie from "lottie-react";

export default function LottieAnimation({
  animationData,
  className,
  loop = true,
  autoplay = true,
  ...props
}) {
  return (
    <Lottie
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      className={className}
      {...props}
    />
  );
}
