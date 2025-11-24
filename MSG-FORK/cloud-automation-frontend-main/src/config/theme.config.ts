/**
 * makeStuffGo Theme Configuration
 *
 * This file exports the unified theme palette matching the DaisyUI theme.
 * Use these constants for consistent theming across the application.
 */

export const MakeStuffGoTheme = {
  // Primary colors (Main blue)
  primary: "#2563EB",
  primaryContent: "#FFFFFF",

  // Secondary colors (Darker blue)
  secondary: "#1E40AF",
  secondaryContent: "#FFFFFF",

  // Accent colors (Lighter blue)
  accent: "#3B82F6",
  accentContent: "#FFFFFF",

  // Neutral colors (Dark gray/black)
  neutral: "#111827",
  neutralContent: "#FFFFFF",

  // Base colors (Backgrounds)
  base100: "#FFFFFF", // White cards
  base200: "#F9FAFB", // Light gray background
  base300: "#E5E7EB", // Border gray
  baseContent: "#111827", // Dark text on white

  // Semantic colors (All blue-based for consistency)
  info: "#2563EB",
  infoContent: "#FFFFFF",
  success: "#2563EB",
  successContent: "#FFFFFF",
  warning: "#93C5FD",
  warningContent: "#1E3A8A",
  error: "#1E3A8A",
  errorContent: "#FFFFFF",
} as const

/**
 * DaisyUI Class Mappings
 * Use these for quick reference to DaisyUI utility classes
 */
export const ThemeClasses = {
  // Buttons
  btnPrimary: "btn btn-primary",
  btnSecondary: "btn btn-secondary",
  btnAccent: "btn btn-accent",
  btnOutline: "btn btn-outline",
  btnGhost: "btn btn-ghost",

  // Cards
  card: "bg-base-100 border border-base-300 rounded-xl shadow-sm",
  cardCompact: "bg-base-100 border border-base-300 rounded-lg shadow-sm",

  // Backgrounds
  bgPage: "bg-base-200",
  bgCard: "bg-base-100",
  bgSurface: "bg-base-100",

  // Text
  textPrimary: "text-base-content",
  textSecondary: "text-neutral",
  textMuted: "text-gray-500",

  // Borders
  border: "border-base-300",
  borderPrimary: "border-primary",

  // Badges
  badgePrimary: "badge badge-primary",
  badgeSecondary: "badge badge-secondary",
  badgeAccent: "badge badge-accent",
  badgeInfo: "badge badge-info",
  badgeSuccess: "badge badge-success",
  badgeWarning: "badge badge-warning",
  badgeError: "badge badge-error",
} as const

export default MakeStuffGoTheme
