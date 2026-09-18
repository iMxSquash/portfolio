import { lookup } from "node:dns/promises";

const MAX_REDIRECTS = 5;

function isPrivateIPv4(address: string): boolean {
  const octets = address.split(".").map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet))) return true;
  const [a, b] = octets;
  return (
    a === 0 ||
    a === 127 ||
    a === 10 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254) ||
    (a === 100 && b >= 64 && b <= 127) // CGNAT — also used internally by some cloud providers
  );
}

function isPrivateIPv6(address: string): boolean {
  const normalized = address.toLowerCase();
  if (normalized === "::1" || normalized === "::") return true;
  if (
    normalized.startsWith("fe80:") ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd")
  ) {
    return true;
  }
  // IPv4-mapped (::ffff:a.b.c.d) — validate the embedded IPv4 address too.
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(normalized);
  return mapped ? isPrivateIPv4(mapped[1]) : false;
}

/**
 * Resolves `hostname` and reports whether it (and every one of its resolved
 * IPs) is public — blocks SSRF toward internal infrastructure (including
 * cloud metadata endpoints like 169.254.169.254) via a public domain name
 * that resolves to an internal address (DNS rebinding). DNS resolution
 * alone covers literal IPs and `localhost` too (`dns.lookup` returns a
 * literal IP unchanged, and resolves `localhost` to a loopback address), so
 * no separate hostname-pattern check is needed on top of this.
 */
export async function isPublicHostname(hostname: string): Promise<boolean> {
  try {
    const records = await lookup(hostname, { all: true, verbatim: true });
    return (
      records.length > 0 &&
      records.every((record) =>
        record.family === 4 ? !isPrivateIPv4(record.address) : !isPrivateIPv6(record.address),
      )
    );
  } catch {
    return false;
  }
}

/**
 * Fetches `url`, following redirects manually (instead of `redirect:
 * "follow"`) so every hop's hostname is re-resolved and re-validated against
 * private/internal IP ranges before being fetched — a redirect can point
 * somewhere the original URL didn't. The caller must validate `url`'s own
 * hostname with `isPublicHostname` before calling this: only hosts a
 * redirect introduces (hop > 0) are re-checked here, so the initial host
 * isn't resolved twice.
 */
export async function fetchWithSsrfGuard(url: URL, init: RequestInit): Promise<Response> {
  let currentUrl = url;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (currentUrl.protocol !== "https:") {
      throw new Error("redirected to a non-https URL");
    }
    if (hop > 0 && !(await isPublicHostname(currentUrl.hostname))) {
      throw new Error("redirected to a private hostname");
    }

    const response = await fetch(currentUrl, { ...init, redirect: "manual" });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) return response;
      currentUrl = new URL(location, currentUrl);
      continue;
    }
    return response;
  }

  throw new Error("too many redirects");
}
