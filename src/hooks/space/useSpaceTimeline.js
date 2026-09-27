"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  TIMELINE_ORIENTATION,
  TIMELINE_BREAKPOINTS,
} from "@/config/timeline/orientation";

export default function useSpaceTimeline({ onMonthChange } = {}) {
  const [preference, setPreference] = useState(TIMELINE_ORIENTATION.AUTO);

  const [orientation, setOrientation] = useState(
    TIMELINE_ORIENTATION.HORIZONTAL,
  );

  const [progress, setProgress] = useState(0);

  const railRef = useRef(null);
  const timelineRef = useRef(null);
  const animationFrameRef = useRef(null);

  /* =========================================================
     ORIENTATION
     ========================================================= */

  useEffect(() => {
    const updateOrientation = () => {
      if (preference !== TIMELINE_ORIENTATION.AUTO) {
        setOrientation(preference);
        return;
      }

      setOrientation(
        window.innerWidth < TIMELINE_BREAKPOINTS.verticalBelowPx
          ? TIMELINE_ORIENTATION.VERTICAL
          : TIMELINE_ORIENTATION.HORIZONTAL,
      );
    };

    updateOrientation();

    window.addEventListener("resize", updateOrientation);

    return () => {
      window.removeEventListener("resize", updateOrientation);
    };
  }, [preference]);

  /* =========================================================
     PROGRESS
     ========================================================= */

  const updateHorizontalProgress = useCallback(() => {
    const rail = railRef.current;

    if (!rail) {
      setProgress(0);
      return;
    }

    const maxScroll = rail.scrollWidth - rail.clientWidth;

    if (maxScroll <= 0) {
      setProgress(0);
      return;
    }

    setProgress(Math.min(1, Math.max(0, rail.scrollLeft / maxScroll)));
  }, []);

  const updateVerticalProgress = useCallback(() => {
    const timeline = timelineRef.current;

    if (!timeline) {
      setProgress(0);
      return;
    }

    const rect = timeline.getBoundingClientRect();

    const readingLine = window.innerHeight * 0.42;

    const travelled = readingLine - rect.top;

    const scrollableDistance = timeline.offsetHeight - readingLine;

    if (scrollableDistance <= 0) {
      setProgress(0);
      return;
    }

    setProgress(Math.min(1, Math.max(0, travelled / scrollableDistance)));
  }, []);

  const updateProgress = useCallback(() => {
    if (animationFrameRef.current !== null) {
      return;
    }

    animationFrameRef.current = window.requestAnimationFrame(() => {
      animationFrameRef.current = null;

      if (orientation === TIMELINE_ORIENTATION.HORIZONTAL) {
        updateHorizontalProgress();
      } else {
        updateVerticalProgress();
      }
    });
  }, [orientation, updateHorizontalProgress, updateVerticalProgress]);

  /* =========================================================
     ACTIVE MONTH
     ========================================================= */

  const updateHorizontalMonth = useCallback(() => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    const nodes = rail.querySelectorAll("[data-month]");

    const center = rail.scrollLeft + rail.clientWidth / 2;

    let closestMonth = null;
    let closestDistance = Infinity;

    nodes.forEach((node) => {
      const nodeCenter = node.offsetLeft + node.offsetWidth / 2;

      const distance = Math.abs(nodeCenter - center);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestMonth = node.dataset.month;
      }
    });

    if (closestMonth) {
      onMonthChange?.(closestMonth);
    }
  }, [onMonthChange]);

  const updateVerticalMonth = useCallback(() => {
    const timeline = timelineRef.current;

    if (!timeline) {
      return;
    }

    const nodes = timeline.querySelectorAll("[data-timeline-event]");

    const readingLine = window.innerHeight * 0.42;

    let closestMonth = null;
    let closestDistance = Infinity;

    nodes.forEach((node) => {
      const rect = node.getBoundingClientRect();

      if (rect.bottom < 80 || rect.top > window.innerHeight) {
        return;
      }

      const center = rect.top + rect.height / 2;

      const distance = Math.abs(center - readingLine);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestMonth = node.dataset.month;
      }
    });

    if (closestMonth) {
      onMonthChange?.(closestMonth);
    }
  }, [onMonthChange]);

  /* =========================================================
     VERTICAL SCROLL
     ========================================================= */

  useEffect(() => {
    if (orientation !== TIMELINE_ORIENTATION.VERTICAL) {
      return;
    }

    const handleScroll = () => {
      updateProgress();
      updateVerticalMonth();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    window.addEventListener("resize", handleScroll);

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);

      window.removeEventListener("resize", handleScroll);
    };
  }, [orientation, updateProgress, updateVerticalMonth]);

  /* =========================================================
     HORIZONTAL SCROLL
     ========================================================= */

  useEffect(() => {
    const rail = railRef.current;

    if (!rail || orientation !== TIMELINE_ORIENTATION.HORIZONTAL) {
      return;
    }

    const handleWheel = (event) => {
      if (
        Math.abs(event.deltaY) <= Math.abs(event.deltaX) ||
        Math.abs(event.deltaY) < 2
      ) {
        return;
      }

      const atStart = rail.scrollLeft <= 0 && event.deltaY < 0;

      const atEnd =
        rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 1 &&
        event.deltaY > 0;

      if (atStart || atEnd) {
        return;
      }

      event.preventDefault();

      rail.scrollLeft += event.deltaY;
    };

    const handleScroll = () => {
      updateProgress();
      updateHorizontalMonth();
    };

    rail.addEventListener("wheel", handleWheel, { passive: false });

    rail.addEventListener("scroll", handleScroll, { passive: true });

    handleScroll();

    return () => {
      rail.removeEventListener("wheel", handleWheel);

      rail.removeEventListener("scroll", handleScroll);
    };
  }, [orientation, updateProgress, updateHorizontalMonth]);

  /* =========================================================
     NAVIGATION
     ========================================================= */

  const jumpHorizontal = useCallback((direction) => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    rail.scrollBy({
      left: direction * Math.max(window.innerWidth * 0.72, 460),
      behavior: "smooth",
    });
  }, []);

  const jumpToMonth = useCallback(
    (monthKey) => {
      if (!monthKey) {
        return;
      }

      if (orientation === TIMELINE_ORIENTATION.HORIZONTAL) {
        const rail = railRef.current;

        rail?.querySelector(`[data-month="${monthKey}"]`)?.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      } else {
        const timeline = timelineRef.current;

        timeline
          ?.querySelector(`[data-timeline-event][data-month="${monthKey}"]`)
          ?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
      }

      onMonthChange?.(monthKey);
    },
    [orientation, onMonthChange],
  );

  /* =========================================================
     CLEANUP
     ========================================================= */

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);

        animationFrameRef.current = null;
      }
    };
  }, []);

  return {
    orientation,
    preference,
    setPreference,

    progress,

    railRef,
    timelineRef,

    jumpHorizontal,
    jumpToMonth,
  };
}
