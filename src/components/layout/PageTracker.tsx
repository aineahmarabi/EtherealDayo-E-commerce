"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function PageTracker() {
  const pathname = usePathname();
  const recordView = useMutation(api.pageViews.record);

  useEffect(() => {
    if (pathname && !pathname.startsWith("/admin")) {
      recordView({ path: pathname }).catch(console.error);
    }
  }, [pathname, recordView]);

  return null;
}
