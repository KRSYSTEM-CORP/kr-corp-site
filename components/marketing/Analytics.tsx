"use client";

import { useEffect } from "react";

// First-party visit and click counting for the admin summary. No cookies and no
// identifiers: just the path, the referring host and the utm_source.
function send(type: "visit" | "cta" | "contact") {
  try {
    const ref = document.referrer ? new URL(document.referrer).hostname : "";
    const utm = new URLSearchParams(location.search).get("utm_source") ?? "";
    const body = JSON.stringify({
      type,
      path: location.pathname,
      referrer: ref && ref !== location.hostname ? ref : "",
      utmSource: utm,
    });
    navigator.sendBeacon("/api/evento", new Blob([body], { type: "application/json" }));
  } catch {
    /* analytics must never break the page */
  }
}

export function Analytics() {
  useEffect(() => {
    try {
      if (!sessionStorage.getItem("kr-visit")) {
        sessionStorage.setItem("kr-visit", "1");
        send("visit");
      }
    } catch {
      send("visit");
    }

    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a");
      const href = a?.getAttribute("href") ?? "";
      if (/^(https:\/\/wa\.me|mailto:|tel:)/.test(href)) send("contact");
      else if (href === "#contacto") send("cta");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
