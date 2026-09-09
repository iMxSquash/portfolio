import { headers } from "next/headers";
import { userAgent } from "next/server";
import { OS } from "@/components/os/OS";
import { resolveOSModeFromUserAgent } from "@/lib/device";

export default async function Home() {
  const { device, os } = userAgent({ headers: await headers() });
  return <OS initialMode={resolveOSModeFromUserAgent({ device, os })} />;
}
