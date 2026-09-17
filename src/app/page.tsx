import { headers } from "next/headers";
import { userAgent } from "next/server";
import { OS } from "@/components/os/OS";
import { SeoFallbackContent } from "@/components/seo/SeoFallbackContent";
import { resolveOSModeFromUserAgent } from "@/lib/device";
import { getVisibleProjectRows, projectRowToApp } from "@/lib/projects";

export default async function Home() {
  const { device, os } = userAgent({ headers: await headers() });
  const visibleProjectRows = await getVisibleProjectRows();
  const initialProjectApps = visibleProjectRows.map(projectRowToApp);

  return (
    <>
      <SeoFallbackContent projects={visibleProjectRows} />
      <OS
        initialMode={resolveOSModeFromUserAgent({ device, os })}
        initialProjectApps={initialProjectApps}
      />
    </>
  );
}
