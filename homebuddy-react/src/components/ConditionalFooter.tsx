"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Footer from "./footer";

export default function ConditionalFooter() {
  const pathname = usePathname();
  const [is404, setIs404] = useState(false);

  useEffect(() => {
    // Check if the page is a 404 by looking for the body class or other indicators
    const checkFor404 = () => {
      const isNotFoundPage =
        document.title.includes("404") ||
        document.querySelector("h1")?.textContent?.includes("404");
      setIs404(!!isNotFoundPage);
    };

    checkFor404();
  }, [pathname]);

  // Hide footer on these routes
  const hideFooterRoutes = ["/admin", "/checkout"];

  // Check if current path starts with any of the hideFooterRoutes
  const shouldHideFooter =
    hideFooterRoutes.some((route) => pathname?.startsWith(route)) || is404;

  if (shouldHideFooter) {
    return null;
  }

  return <Footer />;
}
