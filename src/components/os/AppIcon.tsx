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
    </span>
  );
}

function IconComponent({ icon: Icon }: { icon: ComponentType }) {
  return <Icon />;
}
