"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL ?? "";

const convex = CONVEX_URL
  ? new ConvexReactClient(CONVEX_URL)
  : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    // No Convex URL — skeletons will show everywhere
    return <>{children}</>;
  }
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
