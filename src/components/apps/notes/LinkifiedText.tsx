import { useMemo } from "react";

// Matches http(s) URLs and e-mail addresses; stops before a trailing ")" so
// a URL written as "(https://example.com)" linkifies without swallowing the
// closing parenthesis.
const LINK_PATTERN = /(https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+\.[\w.-]+)/;

/**
 * Reproduces macOS Notes' "data detectors": URLs and e-mail addresses
 * written as plain text become tappable system-blue links, with no markup
 * needed in notes-content.ts — body paragraphs stay plain strings.
 */
export function LinkifiedText({ text }: { text: string }) {
  // Mounted once per body paragraph of the selected note, so a parent
  // re-render unrelated to `text` (theme toggle, nav transition…) must not
  // redo the regex split.
  const parts = useMemo(() => text.split(LINK_PATTERN), [text]);

  return (
    <>
      {parts.map((part, index) => {
        // `split` with a single capturing group interleaves matches at odd
        // indices; everything else is plain text passed through as-is.
        if (index % 2 === 0) return part;

        const isEmail = !part.startsWith("http");
        return (
          <a
            key={index}
            href={isEmail ? `mailto:${part}` : part}
            target={isEmail ? undefined : "_blank"}
            rel={isEmail ? undefined : "noopener noreferrer"}
            className="text-system-blue underline underline-offset-2"
          >
            {part}
          </a>
        );
      })}
    </>
  );
}
