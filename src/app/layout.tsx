import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { SettingsEffectsProvider } from "@/components/os/SettingsEffectsProvider";
import { ThemeProvider } from "@/components/os/ThemeProvider";
import { BOOT_STORAGE_KEY, DISPLAY_NAME } from "@/lib/boot";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/seo";
import { SETTINGS_STORAGE_KEY } from "@/lib/settings";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const DEFAULT_TITLE = `${DISPLAY_NAME} : ${SITE_TAGLINE}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: `%s : ${DISPLAY_NAME}` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

// `viewport-fit: cover` lets iOS content draw under the notch/Dynamic
// Island/home indicator so `env(safe-area-inset-*)` (status bar, iOS dock,
// home indicator — see os-ios-ui skill) has something to inset against.
export const viewport: Viewport = {
  viewportFit: "cover",
};

// Applies the persisted (or system) theme before hydration, so there's no
// flash of the wrong theme. Only ever reads our own localStorage key.
const themeInitScript = `(function () {
  try {
    var raw = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    var mode = raw ? JSON.parse(raw).state.mode : "system";
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var isDark = mode === "dark" || (mode === "system" && prefersDark);
    if (isDark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();`;

// Hides the boot/login overlay before hydration if this session already
// played it (see BootScreen.tsx + the .boot-seen rule in globals.css).
// Only ever reads our own sessionStorage key.
const bootInitScript = `(function () {
  try {
    if (sessionStorage.getItem(${JSON.stringify(BOOT_STORAGE_KEY)}) === "1") {
      document.documentElement.classList.add("boot-seen");
    }
  } catch (e) {}
})();`;

// Applies the persisted accent color / increase-contrast setting before
// hydration, same anti-FOUC reasoning as themeInitScript above — see
// SettingsEffectsProvider.tsx for the runtime (post-hydration) sync. Only
// ever reads our own localStorage key.
const settingsInitScript = `(function () {
  try {
    var raw = localStorage.getItem(${JSON.stringify(SETTINGS_STORAGE_KEY)});
    var state = raw ? JSON.parse(raw).state : null;
    var accent = state && state.appearance ? state.appearance.accentColor : "multicolor";
    if (accent && accent !== "multicolor") {
      document.documentElement.setAttribute("data-accent", accent);
    }
    if (state && state.accessibility && state.accessibility.increaseContrast) {
      document.documentElement.classList.add("increase-contrast");
    }
  } catch (e) {}
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} h-dvh overflow-hidden antialiased`}
      suppressHydrationWarning
    >
      <body className="h-full flex flex-col overflow-hidden overscroll-none">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <Script id="boot-init" strategy="beforeInteractive">
          {bootInitScript}
        </Script>
        <Script id="settings-init" strategy="beforeInteractive">
          {settingsInitScript}
        </Script>
        <ThemeProvider />
        <SettingsEffectsProvider />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
