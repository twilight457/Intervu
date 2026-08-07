"use client";

import { useEffect, useState } from "react";

/**
 * Custom hook to safely handle client-side rendering mounted state.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
