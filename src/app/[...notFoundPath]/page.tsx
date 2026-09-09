import { redirect } from "next/navigation";

// Catches every route not matched by a more specific page (Next.js always
// prefers a literal/dynamic match over a catch-all) and bounces it to the
// "fichier introuvable" mini-game (see the `introuvable` repo), forwarding
// the originally requested path so it can rebuild the Finder breadcrumb.
export default async function NotFoundRedirect({
  params,
}: {
  params: Promise<{ notFoundPath: string[] }>;
}) {
  const notFoundUrl = process.env["404_URL"];
  if (!notFoundUrl) {
    throw new Error("Missing 404_URL environment variable");
  }

  const { notFoundPath } = await params;
  const requestedPath = `/${notFoundPath.join("/")}`;
  const destination = new URL(notFoundUrl);
  destination.searchParams.set("path", requestedPath);

  redirect(destination.toString());
}
