import dayjs from "dayjs";

import getPostTypeConfig
from "./getPostTypeConfig";

import getDerivedPostStatus
from "./getDerivedPostStatus";

export default function getPostStatus(
  post,
  now = null
) {
  const config =
    getPostTypeConfig(
      post.type
    );

  // =====================================================
  // MANUAL STATUS
  // =====================================================

  if (post.status) {
    return {
      key: post.status,

      config:
        config.statuses?.[
          post.status
        ] || null,

      derived: false,

      countdown: null,
    };
  }

  // =====================================================
  // DERIVED STATUS
  // =====================================================

  const derived =
    getDerivedPostStatus(
      post,
      config,
      now
    );

  // =====================================================
  // COUNTDOWN
  // =====================================================

  let countdown = null;

  if (
    now &&
    config.showCountdown &&
    derived === "upcoming" &&
    post.start_at
  ) {
    const diffSeconds =
      dayjs(post.start_at).diff(
        dayjs(now),
        "second"
      );

    if (diffSeconds > 0) {
      const days =
        Math.floor(
          diffSeconds /
            86400
        );

      const hours =
        Math.floor(
          (diffSeconds %
            86400) /
            3600
        );

      const minutes =
        Math.floor(
          (diffSeconds %
            3600) /
            60
        );

      const seconds =
        diffSeconds % 60;

      countdown = {
        days,
        hours,
        minutes,
        seconds,
      };
    }
  }

  // =====================================================
  // RETURN
  // =====================================================

  return {
    key: derived,

    config:
      config.statuses?.[
        derived
      ] || null,

    derived: true,

    countdown,
  };
}