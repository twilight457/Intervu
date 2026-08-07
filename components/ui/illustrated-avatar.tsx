import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarPreset {
  bgColor: string;
  skinColor: string;
  hairColor: string;
  shirtColor: string;
  gender: "female" | "male";
  hairType:
    | "long_wavy"
    | "short_fade"
    | "bob"
    | "curly"
    | "bun"
    | "side_part"
    | "afro" | "bangs" | "grey_beard" | "straight" | "sleek_long" | "wavy_bob";
  glasses?: boolean;
}

const AVATAR_PRESETS: Record<string, AvatarPreset> = {
  // CAND-001: Sarah Johnson (Female)
  "CAND-001": {
    bgColor: "#E0E7FF",
    skinColor: "#F5D0A9",
    hairColor: "#4A2E2B",
    shirtColor: "#4F46E5",
    gender: "female",
    hairType: "long_wavy",
  },
  // CAND-002: Alex Turner (Male)
  "CAND-002": {
    bgColor: "#E0F2FE",
    skinColor: "#FCE7D0",
    hairColor: "#27272A",
    shirtColor: "#0284C7",
    gender: "male",
    hairType: "side_part",
    glasses: true,
  },
  // CAND-003: Emily Chen (Female)
  "CAND-003": {
    bgColor: "#DCFCE7",
    skinColor: "#FAD7BE",
    hairColor: "#18181B",
    shirtColor: "#16A34A",
    gender: "female",
    hairType: "bob",
  },
  // CAND-004: David Miller (Male)
  "CAND-004": {
    bgColor: "#FFEDD5",
    skinColor: "#C68642",
    hairColor: "#291E1A",
    shirtColor: "#EA580C",
    gender: "male",
    hairType: "curly",
  },
  // CAND-005: Michael Brown (Male)
  "CAND-005": {
    bgColor: "#F3E8FF",
    skinColor: "#8D5524",
    hairColor: "#171717",
    shirtColor: "#9333EA",
    gender: "male",
    hairType: "short_fade",
  },
  // CAND-006: Wendy Foster (Female)
  "CAND-006": {
    bgColor: "#FFE4E6",
    skinColor: "#FCE5CD",
    hairColor: "#D97706",
    shirtColor: "#E11D48",
    gender: "female",
    hairType: "long_wavy",
  },
  // CAND-007: Ethan Brooks (Male)
  "CAND-007": {
    bgColor: "#CCFBF1",
    skinColor: "#FDDFCA",
    hairColor: "#78350F",
    shirtColor: "#0D9488",
    gender: "male",
    hairType: "side_part",
  },
  // CAND-008: Harold Whitfield (Male)
  "CAND-008": {
    bgColor: "#F1F5F9",
    skinColor: "#F5D6BA",
    hairColor: "#94A3B8",
    shirtColor: "#475569",
    gender: "male",
    hairType: "grey_beard",
    glasses: true,
  },
  // CAND-009: Zara Ahmadi (Female)
  "CAND-009": {
    bgColor: "#FAE8FF",
    skinColor: "#D69F7E",
    hairColor: "#1F2937",
    shirtColor: "#C026D3",
    gender: "female",
    hairType: "bun",
  },
  // CAND-010: Gerald Combs (Male)
  "CAND-010": {
    bgColor: "#FEF3C7",
    skinColor: "#C68642",
    hairColor: "#111827",
    shirtColor: "#D97706",
    gender: "male",
    hairType: "short_fade",
  },
  // CAND-011: Mia Alvarez (Female)
  "CAND-011": {
    bgColor: "#FEE2E2",
    skinColor: "#F7D6B8",
    hairColor: "#451A03",
    shirtColor: "#DC2626",
    gender: "female",
    hairType: "sleek_long",
  },
  // CAND-012: Chen Wei (Male)
  "CAND-012": {
    bgColor: "#E0F2FE",
    skinColor: "#FBE3CD",
    hairColor: "#09090B",
    shirtColor: "#2563EB",
    gender: "male",
    hairType: "straight",
  },
  // CAND-013: Ravi Patel (Male)
  "CAND-013": {
    bgColor: "#E0E7FF",
    skinColor: "#AE7047",
    hairColor: "#18181B",
    shirtColor: "#6366F1",
    gender: "male",
    hairType: "side_part",
  },
  // CAND-014: Bethany Cole (Female)
  "CAND-014": {
    bgColor: "#FFE4E6",
    skinColor: "#FAD7BE",
    hairColor: "#78350F",
    shirtColor: "#E11D48",
    gender: "female",
    hairType: "wavy_bob",
  },
  // CAND-015: Noah Kim (Male)
  "CAND-015": {
    bgColor: "#CCFBF1",
    skinColor: "#FCE7D0",
    hairColor: "#09090B",
    shirtColor: "#0D9488",
    gender: "male",
    hairType: "straight",
  },
  // CAND-016: Isabella Rossi (Female)
  "CAND-016": {
    bgColor: "#F3E8FF",
    skinColor: "#FCE5CD",
    hairColor: "#27272A",
    shirtColor: "#9333EA",
    gender: "female",
    hairType: "long_wavy",
  },
  // CAND-017: Tyler Brooks (Male)
  "CAND-017": {
    bgColor: "#FFEDD5",
    skinColor: "#C68642",
    hairColor: "#171717",
    shirtColor: "#EA580C",
    gender: "male",
    hairType: "short_fade",
  },
  // CAND-018: Diane Foster (Female)
  "CAND-018": {
    bgColor: "#DCFCE7",
    skinColor: "#F7D6B8",
    hairColor: "#4A2E2B",
    shirtColor: "#16A34A",
    gender: "female",
    hairType: "bob",
  },
  // CAND-019: Frank DeLuca (Male)
  "CAND-019": {
    bgColor: "#F1F5F9",
    skinColor: "#FDDFCA",
    hairColor: "#475569",
    shirtColor: "#334155",
    gender: "male",
    hairType: "side_part",
  },
  // CAND-020: Priyanka Sharma (Female)
  "CAND-020": {
    bgColor: "#FAE8FF",
    skinColor: "#B87333",
    hairColor: "#09090B",
    shirtColor: "#C026D3",
    gender: "female",
    hairType: "sleek_long",
  },
};

const DEFAULT_PRESET: AvatarPreset = {
  bgColor: "#E0E7FF",
  skinColor: "#F5D0A9",
  hairColor: "#27272A",
  shirtColor: "#4F46E5",
  gender: "male",
  hairType: "short_fade",
};

interface IllustratedAvatarProps {
  candidateId?: string;
  index?: number;
  className?: string;
  size?: number;
}

export function IllustratedAvatar({
  candidateId = "",
  index = 0,
  className,
  size = 56,
}: IllustratedAvatarProps) {
  const keys = Object.keys(AVATAR_PRESETS);
  const preset =
    AVATAR_PRESETS[candidateId] ||
    AVATAR_PRESETS[keys[index % keys.length]] ||
    DEFAULT_PRESET;

  const { bgColor, skinColor, hairColor, shirtColor, hairType, glasses } = preset;

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-2xl flex items-center justify-center border border-white/10 shadow-2xs select-none",
        className
      )}
      style={{ width: size, height: size, backgroundColor: bgColor }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft Background Fill */}
        <rect width="100" height="100" fill={bgColor} rx="20" />

        {/* Shoulders / Shirt */}
        <path
          d="M20 92C20 76 33 70 50 70C67 70 80 76 80 92V100H20V92Z"
          fill={shirtColor}
        />
        {/* Collar Detail */}
        <path
          d="M44 70L50 78L56 70"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Neck */}
        <rect x="42" y="54" width="16" height="18" rx="4" fill={skinColor} />
        {/* Neck Shadow */}
        <path d="M42 54C46 57 54 57 58 54V59H42V54Z" fill="rgba(0,0,0,0.06)" />

        {/* Head Shape (Faceless silhouette) */}
        <ellipse cx="50" cy="46" rx="20" ry="24" fill={skinColor} />

        {/* Ears */}
        <circle cx="29" cy="46" r="4" fill={skinColor} />
        <circle cx="71" cy="46" r="4" fill={skinColor} />

        {/* Hairstyles (Faceless Minimalist Silhouette Style) */}
        {hairType === "long_wavy" && (
          <path
            d="M26 44C24 30 33 18 50 18C67 18 76 30 74 44C72 52 76 62 76 68C76 72 72 74 70 70C70 55 69 38 69 38C69 28 60 22 50 22C40 22 31 28 31 38C31 38 30 55 30 70C28 74 24 72 24 68C24 62 28 52 26 44Z"
            fill={hairColor}
          />
        )}

        {hairType === "sleek_long" && (
          <path
            d="M26 48C25 32 34 18 50 18C66 18 75 32 74 48C73 58 74 68 74 74C74 76 70 76 69 72C69 55 68 36 68 36C68 26 60 21 50 21C40 21 32 26 32 36C32 36 31 55 31 72C30 76 26 76 26 74C26 68 27 58 26 48Z"
            fill={hairColor}
          />
        )}

        {hairType === "wavy_bob" && (
          <path
            d="M27 46C25 30 34 19 50 19C66 19 75 30 73 46C72 54 69 62 67 62C67 44 65 23 50 23C35 23 33 44 33 62C31 62 28 54 27 46Z"
            fill={hairColor}
          />
        )}

        {hairType === "bob" && (
          <path
            d="M28 46C26 32 35 20 50 20C65 20 74 32 72 46C72 54 70 60 68 60C68 42 65 24 50 24C35 24 32 42 32 60C30 60 28 54 28 46Z"
            fill={hairColor}
          />
        )}

        {hairType === "side_part" && (
          <path
            d="M28 44C27 33 34 21 50 21C64 21 72 31 72 44C72 37 68 24 54 24C38 24 30 35 28 44Z"
            fill={hairColor}
          />
        )}

        {hairType === "curly" && (
          <g fill={hairColor}>
            <circle cx="50" cy="22" r="11" />
            <circle cx="39" cy="25" r="10" />
            <circle cx="61" cy="25" r="10" />
            <circle cx="30" cy="33" r="9" />
            <circle cx="70" cy="33" r="9" />
            <circle cx="28" cy="42" r="8" />
            <circle cx="72" cy="42" r="8" />
          </g>
        )}

        {hairType === "afro" && (
          <circle cx="50" cy="36" r="25" fill={hairColor} />
        )}

        {hairType === "short_fade" && (
          <path
            d="M29 42C28 31 36 21 50 21C64 21 72 31 71 42C71 35 64 24 50 24C36 24 29 35 29 42Z"
            fill={hairColor}
          />
        )}

        {hairType === "bun" && (
          <g fill={hairColor}>
            <circle cx="50" cy="14" r="10" />
            <path d="M29 44C27 32 35 21 50 21C65 21 73 32 71 44C71 35 64 24 50 24C36 24 29 35 29 44Z" />
          </g>
        )}

        {hairType === "bangs" && (
          <path
            d="M27 46C27 30 34 20 50 20C66 20 73 30 73 46C73 36 63 24 50 24C37 24 27 36 27 46Z"
            fill={hairColor}
          />
        )}

        {hairType === "straight" && (
          <path
            d="M29 44C27 32 35 21 50 21C65 21 73 32 71 44C71 36 64 25 50 25C36 25 29 36 29 44Z"
            fill={hairColor}
          />
        )}

        {hairType === "grey_beard" && (
          <g>
            <path
              d="M29 44C27 32 35 21 50 21C65 21 73 32 71 44C71 36 64 25 50 25C36 25 29 36 29 44Z"
              fill={hairColor}
            />
            {/* Minimal Beard Silhouette */}
            <path
              d="M37 50C37 65 42 71 50 71C58 71 63 65 63 50C59 55 41 55 37 50Z"
              fill="#CBD5E1"
            />
          </g>
        )}

        {/* Glasses Option (Faceless frame) */}
        {glasses && (
          <g stroke="#18181B" strokeWidth="2.5" fill="none">
            <rect x="35" y="40" width="12" height="10" rx="3" fill="rgba(255,255,255,0.25)" />
            <rect x="53" y="40" width="12" height="10" rx="3" fill="rgba(255,255,255,0.25)" />
            <line x1="47" y1="44" x2="53" y2="44" />
            <line x1="28" y1="43" x2="35" y2="43" />
            <line x1="65" y1="43" x2="72" y2="43" />
          </g>
        )}
      </svg>
    </div>
  );
}
