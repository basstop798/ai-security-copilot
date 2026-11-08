import type { SVGProps } from "react";
import type { CategoryId } from "@/lib/store";

// Generic line icons. Deliberately no console-maker logos or button symbols:
// the category labels carry the brand names, the pictures stay generic.

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 24, strokeWidth = 1.75, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const ConsoleTowerIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 2.5h6a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1z" />
    <path d="M12 5v12" />
    <path d="M7 21.5h10" />
  </Svg>
);

export const ConsoleBoxIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="6" y="3" width="12" height="17" rx="2" />
    <circle cx="12" cy="7.5" r="2" />
    <path d="M9.5 16h5" />
    <path d="M9 21.5h6" />
  </Svg>
);

export const ConsoleSlabIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2.5 9.5h19l-1.2 5.5H3.7z" />
    <path d="M3.1 12.2h17.8" />
    <path d="M6 18h12" />
  </Svg>
);

export const HandheldIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2" y="6" width="20" height="12" rx="3" />
    <rect x="7" y="8.5" width="10" height="7" rx="1" />
    <path d="M4.5 11v2M3.5 12h2" />
    <circle cx="19.5" cy="11" r=".6" />
    <circle cx="19.5" cy="13.5" r=".6" />
  </Svg>
);

export const GamepadIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 11h4M8 9v4" />
    <path d="M15 12h.01M18 10h.01" />
    <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
  </Svg>
);

export const HeadphonesIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
  </Svg>
);

export const GameCaseIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="5" y="2.5" width="14" height="19" rx="2" />
    <path d="M5 6.5h14" />
    <circle cx="12" cy="14" r="3.5" />
    <circle cx="12" cy="14" r=".8" />
  </Svg>
);

export const CrownIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" />
    <path d="M5 21h14" />
  </Svg>
);

export const StoreIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 9l1.5-5h15L21 9" />
    <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
    <path d="M5 11.5V20h14v-8.5" />
    <path d="M10 20v-5h4v5" />
  </Svg>
);

export const CATEGORY_ICONS: Record<
  CategoryId | "psplus" | "store",
  (p: IconProps) => React.JSX.Element
> = {
  ps5: ConsoleTowerIcon,
  ps4: ConsoleSlabIcon,
  xbox: ConsoleBoxIcon,
  switch: HandheldIcon,
  manettes: GamepadIcon,
  casques: HeadphonesIcon,
  jeux: GameCaseIcon,
  psplus: CrownIcon,
  store: StoreIcon,
};

export const WhatsAppIcon = ({ size = 24, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...p}>
    <path
      d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinejoin="round"
    />
    <path
      transform="translate(7.2 7.2) scale(0.4)"
      fill="currentColor"
      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
    />
  </svg>
);

export const InstagramIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <path d="M17.5 6.5h.01" />
  </Svg>
);

export const FacebookIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </Svg>
);

export const ThreadsIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
  </Svg>
);

export const MapPinIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </Svg>
);

export const ClockIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </Svg>
);

export const PhoneIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </Svg>
);

export const CheckIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Svg>
);

export const ArrowRightIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </Svg>
);

export const MenuIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);

export const CloseIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Svg>
);

export const BanknoteIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M6 12h.01M18 12h.01" />
  </Svg>
);

export const RepeatIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m17 2 4 4-4 4" />
    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
    <path d="m7 22-4-4 4-4" />
    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
  </Svg>
);

export const WrenchIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </Svg>
);

export const HeartIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </Svg>
);
