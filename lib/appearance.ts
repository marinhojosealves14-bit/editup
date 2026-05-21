export type AppearanceTheme = {
  id: string
  name: string
  background: string
  sidebar: string
  surface: string
  text: string
  accent: string
}

export const APPEARANCE_STORAGE_KEY = "editup-appearance-theme"
export const APPEARANCE_SAVED_STORAGE_KEY = "editup-saved-appearance-themes"

export const builtInAppearanceThemes: AppearanceTheme[] = [
  {
    id: "light",
    name: "Claro",
    background: "#F5F7FB",
    sidebar: "#F8FAFC",
    surface: "#FFFFFF",
    text: "#111827",
    accent: "#9DE96C",
  },
  {
    id: "dark",
    name: "Escuro",
    background: "#0B0E14",
    sidebar: "#10151D",
    surface: "#151A23",
    text: "#F8FAFC",
    accent: "#9DE96C",
  },
]

const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)))

const hexToRgb = (hex: string) => {
  const normalized = hex.replace("#", "").trim()
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : normalized

  const value = Number.parseInt(expanded, 16)
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  }
}

const rgbToHex = ({ r, g, b }: { r: number; g: number; b: number }) =>
  `#${[r, g, b]
    .map((part) => clamp(part).toString(16).padStart(2, "0"))
    .join("")}`

const mixHex = (first: string, second: string, weight: number) => {
  const from = hexToRgb(first)
  const to = hexToRgb(second)

  return rgbToHex({
    r: from.r + (to.r - from.r) * weight,
    g: from.g + (to.g - from.g) * weight,
    b: from.b + (to.b - from.b) * weight,
  })
}

const getContrastText = (hex: string) => {
  const { r, g, b } = hexToRgb(hex)
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return luminance > 0.56 ? "#111111" : "#ffffff"
}

const getRelativeLuminance = (hex: string) => {
  const { r, g, b } = hexToRgb(hex)
  const transform = (value: number) => {
    const channel = value / 255
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  }

  return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b)
}

const getContrastRatio = (first: string, second: string) => {
  const firstLuminance = getRelativeLuminance(first)
  const secondLuminance = getRelativeLuminance(second)
  const lighter = Math.max(firstLuminance, secondLuminance)
  const darker = Math.min(firstLuminance, secondLuminance)

  return (lighter + 0.05) / (darker + 0.05)
}

const ensureReadableText = (background: string, preferredText: string) =>
  getContrastRatio(background, preferredText) >= 4.5 ? preferredText : getContrastText(background)

export const normalizeAppearanceTheme = (theme: AppearanceTheme): AppearanceTheme => {
  const id = theme.id?.trim()

  if (id === "dark" || id === "midnight-vanta") {
    return builtInAppearanceThemes[1]
  }

  return builtInAppearanceThemes[0]
}

export const applyAppearanceTheme = (theme: AppearanceTheme) => {
  if (typeof document === "undefined") return

  const normalized = normalizeAppearanceTheme(theme)
  const root = document.documentElement
  root.classList.toggle("dark", normalized.id === "dark")
  root.dataset.appearanceTheme = normalized.id
  const backgroundText = ensureReadableText(normalized.background, normalized.text)
  const surfaceText = ensureReadableText(normalized.surface, normalized.text)
  const sidebarText = ensureReadableText(normalized.sidebar, normalized.text)
  const border = mixHex(normalized.surface, normalized.text, 0.12)
  const muted = mixHex(normalized.background, normalized.surface, 0.78)
  const mutedForeground = ensureReadableText(normalized.background, mixHex(backgroundText, normalized.background, 0.45))
  const secondary = mixHex(normalized.surface, normalized.background, 0.22)
  const sidebarAccent = mixHex(normalized.sidebar, normalized.surface, 0.34)
  const primaryForeground = getContrastText(normalized.accent)

  const entries: Array<[string, string]> = [
    ["--background", normalized.background],
    ["--foreground", backgroundText],
    ["--card", normalized.surface],
    ["--card-foreground", surfaceText],
    ["--popover", normalized.surface],
    ["--popover-foreground", surfaceText],
    ["--primary", normalized.accent],
    ["--primary-foreground", primaryForeground],
    ["--secondary", secondary],
    ["--secondary-foreground", ensureReadableText(secondary, backgroundText)],
    ["--muted", muted],
    ["--muted-foreground", mutedForeground],
    ["--accent", secondary],
    ["--accent-foreground", ensureReadableText(secondary, backgroundText)],
    ["--border", border],
    ["--input", mixHex(normalized.background, normalized.surface, 0.6)],
    ["--ring", normalized.accent],
    ["--chart-1", normalized.accent],
    ["--chart-2", mixHex(normalized.accent, normalized.text, 0.18)],
    ["--chart-3", mixHex(normalized.accent, normalized.text, 0.36)],
    ["--chart-4", mixHex(normalized.accent, normalized.text, 0.54)],
    ["--chart-5", mixHex(normalized.accent, normalized.text, 0.72)],
    ["--sidebar", normalized.sidebar],
    ["--sidebar-foreground", sidebarText],
    ["--sidebar-primary", normalized.accent],
    ["--sidebar-primary-foreground", primaryForeground],
    ["--sidebar-accent", sidebarAccent],
    ["--sidebar-accent-foreground", ensureReadableText(sidebarAccent, sidebarText)],
    ["--sidebar-border", mixHex(normalized.sidebar, normalized.text, 0.12)],
    ["--sidebar-ring", normalized.accent],
  ]

  for (const [token, value] of entries) {
    root.style.setProperty(token, value)
  }
}
