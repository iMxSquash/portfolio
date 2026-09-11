import type { ComponentType } from "react";
import Image from "next/image";
import type { AppDefinition } from "@/lib/apps";

type AppIconProps = {
  app: Pick<AppDefinition, "icon" | "name">;
  className?: string;
};

/**
 * Squircle wrapper (~22.5% radius) shared by dock, desktop and the iOS
 * springboard so every app icon reads consistently regardless of its
 * source (SVG component or image asset) — see os-macos-ui skill.
 *
 * Also applies the macOS 26 Liquid Glass icon material: a top specular
 * highlight + bottom inner shadow layered over every icon, matching the
 * glossy bevel Tahoe gives every system app icon — centralized here rather
 * than redrawn inside each icon SVG.
 */
export function AppIcon({ app, className = "" }: AppIconProps) {
  return (
    <span
      className={`relative block aspect-square w-full overflow-hidden rounded-[22.5%] ${className}`}
    >
      {typeof app.icon === "string" ? (
        <Image src={app.icon} alt="" fill sizes="80px" className="object-cover" draggable={false} />
      ) : (
        <IconComponent icon={app.icon} />
      )}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(155deg, rgb(255 255 255 / 0.5) 0%, rgb(255 255 255 / 0.12) 18%, rgb(255 255 255 / 0) 45%, rgb(0 0 0 / 0.1) 100%)",
          boxShadow: "inset 0 -1px 1px rgb(0 0 0 / 0.15), inset 0 1px 0 rgb(255 255 255 / 0.35)",
        }}
      />
    </span>
  );
}

function IconComponent({ icon: Icon }: { icon: ComponentType }) {
  return <Icon />;
}
