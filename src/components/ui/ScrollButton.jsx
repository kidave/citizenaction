"use client";

import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ScrollButton({ showAfter = 300 }) {
  const [isAtTop, setIsAtTop] = useState(true);

  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;

      const pageHeight = document.body.scrollHeight;

      const windowHeight = window.innerHeight;

      const atTop = scrollTop <= showAfter;

      const atBottom = scrollTop >= pageHeight - windowHeight - showAfter;

      setIsAtTop(atTop);
      setIsAtBottom(atBottom);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [showAfter]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <div className="fixed bottom-20 right-6 z-50">
      {isAtTop ? (
        <Button
          size="icon"
          variant="outline"
          className="rounded-full bg-background/80 shadow-lg backdrop-blur transition-all hover:scale-105"
          onClick={scrollToBottom}
        >
          <ArrowDown className="h-5 w-5" />
        </Button>
      ) : (
        <Button
          size="icon"
          variant="outline"
          className="rounded-full bg-background/80 shadow-lg backdrop-blur transition-all hover:scale-105"
          onClick={scrollToTop}
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
