"use client";

import { useEffect, useState } from "react";
import { isFullscreen } from "@/lib/fullscreen";

export function useFullscreenStatus(): boolean {
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const onChange = () => {
      setFullscreen(isFullscreen());
    };

    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    onChange();

    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  return fullscreen;
}
