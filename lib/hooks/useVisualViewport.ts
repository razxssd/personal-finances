"use client";

import { useEffect, useState } from "react";

export function useKeyboardOffset() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;
    const vv = window.visualViewport;

    const handler = () => {
      const off = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setOffset(off);
    };
    vv.addEventListener("resize", handler);
    vv.addEventListener("scroll", handler);
    handler();
    return () => {
      vv.removeEventListener("resize", handler);
      vv.removeEventListener("scroll", handler);
    };
  }, []);

  return offset;
}
