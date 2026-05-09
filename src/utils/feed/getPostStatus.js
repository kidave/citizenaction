import getPostTypeConfig
from "./getPostTypeConfig";

import getDerivedPostStatus
from "./getDerivedPostStatus";

export default function getPostStatus(
  post
) {
  const config =
    getPostTypeConfig(
      post.type
    );

  // =====================================================
  // MANUAL OVERRIDE
  // =====================================================

  if (post.status) {
    return {
      key: post.status,

      config:
        config.statuses?.[
          post.status
        ] || null,

      derived: false,
    };
  }

  // =====================================================
  // AUTOMATIC
  // =====================================================

  const derived =
    getDerivedPostStatus(
      post,
      config
    );

  return {
    key: derived,

    config:
      config.statuses?.[
        derived
      ] || null,

    derived: true,
  };
}