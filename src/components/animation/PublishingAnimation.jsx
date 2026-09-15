"use client";

import LottieAnimation from "./LottieAnimation";

const animationData = {
  v: "5.7.14",
  fr: 60,
  ip: 0,
  op: 120,
  w: 200,
  h: 200,
  nm: "Publishing",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Pulse",
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [35], e: [100] },
            { t: 30, s: [100], e: [35] },
            { t: 60, s: [35], e: [35] },
            { t: 120, s: [35] },
          ],
        },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [80, 80, 100], e: [110, 110, 100] },
            { t: 30, s: [110, 110, 100], e: [80, 80, 100] },
            { t: 60, s: [80, 80, 100], e: [80, 80, 100] },
            { t: 120, s: [80, 80, 100] },
          ],
        },
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              d: 1,
              ty: "el",
              s: { a: 0, k: [48, 48] },
              p: { a: 0, k: [0, 0] },
              nm: "Ellipse Path",
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.35, 0.35, 0.35, 1] },
              o: { a: 0, k: 100 },
              r: 1,
              bm: 0,
              nm: "Fill",
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
              sk: { a: 0, k: 0 },
              sa: { a: 0, k: 0 },
              nm: "Transform",
            },
          ],
          nm: "Pulse",
          np: 2,
          cix: 2,
          bm: 0,
          ix: 1,
        },
      ],
      ip: 0,
      op: 120,
      st: 0,
      bm: 0,
    },
  ],
};

export default function PublishingAnimation({ className }) {
  return (
    <LottieAnimation
      animationData={animationData}
      className={className}
      loop
      autoplay
      rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
    />
  );
}
