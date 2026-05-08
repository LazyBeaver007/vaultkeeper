import type {
  GraphThemeTokens,
  ResolvedTheme,
  ThemeCustomization,
  ThemeDefinition,
  ThemeName,
  ThemeTokens,
  TypographyThemeSettings,
} from "../types/themes";

export const bodyFontOptions = [
  { value: '"Segoe UI", "Trebuchet MS", sans-serif', label: "Studio Sans" },
  { value: '"Georgia", "Times New Roman", serif', label: "Classic Serif" },
  { value: '"Palatino Linotype", "Book Antiqua", serif', label: "Storybook" },
  { value: '"Gill Sans", "Trebuchet MS", sans-serif', label: "Humanist" },
];

export const headingFontOptions = [
  { value: '"Segoe UI", "Trebuchet MS", sans-serif', label: "Modern Display" },
  { value: '"Georgia", "Times New Roman", serif', label: "Editorial Serif" },
  { value: '"Garamond", "Times New Roman", serif', label: "Arcane Serif" },
  { value: '"Copperplate Gothic", "Georgia", serif', label: "Vault Engraved" },
];

export const editorFontScaleOptions = [
  { value: 92, label: "Compact" },
  { value: 100, label: "Balanced" },
  { value: 110, label: "Comfortable" },
  { value: 120, label: "Immersive" },
];

export const themes: ThemeDefinition[] = [
  {
    id: "codeon",
    label: "Codeon",
    tokens: {
      bg: "#111315",
      panel: "#181a1d",
      panelSoft: "#1f2227",
      border: "#2b2f34",
      text: "#f5f5f5",
      muted: "#9ba4af",
      accent: "#6d7cff",
      shadow: "rgba(0, 0, 0, 0.18)",
      heading: "#ffffff",
      editorBg: "#15181d",
      sidebarBg: "#171a1e",
    },
    graph: {
      node: "#6d7cff",
      edge: "#5b6474",
      label: "#f5f5f5",
    },
    typography: {
      bodyFont: bodyFontOptions[0].value,
      headingFont: headingFontOptions[0].value,
      editorScale: 100,
    },
  },
  {
    id: "cloud-glass",
    label: "Cloud Glass",
    tokens: {
      bg: "#edf4fb",
      panel: "#dfeaf7",
      panelSoft: "#f7fbff",
      border: "#a9bfd8",
      text: "#203749",
      muted: "#698398",
      accent: "#70aee8",
      shadow: "rgba(94, 134, 170, 0.16)",
      heading: "#173246",
      editorBg: "#fbfdff",
      sidebarBg: "#d9e7f4",
    },
    graph: {
      node: "#70aee8",
      edge: "#98bad6",
      label: "#203749",
    },
    typography: {
      bodyFont: bodyFontOptions[0].value,
      headingFont: headingFontOptions[1].value,
      editorScale: 103,
    },
  },
  {
    id: "parchment",
    label: "Parchment",
    tokens: {
      bg: "#efe2c2",
      panel: "#e4d3af",
      panelSoft: "#eadcbc",
      border: "#a47c4b",
      text: "#2b1c0f",
      muted: "#6d5535",
      accent: "#9b4d1f",
      shadow: "rgba(83, 56, 21, 0.12)",
      heading: "#472912",
      editorBg: "#f3e7c8",
      sidebarBg: "#dfcba4",
    },
    graph: {
      node: "#9b4d1f",
      edge: "#8a6a43",
      label: "#2b1c0f",
    },
    typography: {
      bodyFont: bodyFontOptions[2].value,
      headingFont: headingFontOptions[2].value,
      editorScale: 102,
    },
  },
  {
    id: "medieval",
    label: "Medieval",
    tokens: {
      bg: "#201812",
      panel: "#2d221a",
      panelSoft: "#36281e",
      border: "#7b5b3c",
      text: "#efe0c4",
      muted: "#bea785",
      accent: "#c69044",
      shadow: "rgba(0, 0, 0, 0.22)",
      heading: "#f7ead0",
      editorBg: "#261b14",
      sidebarBg: "#2a1f18",
    },
    graph: {
      node: "#c69044",
      edge: "#8f6d4b",
      label: "#efe0c4",
    },
    typography: {
      bodyFont: bodyFontOptions[2].value,
      headingFont: headingFontOptions[3].value,
      editorScale: 104,
    },
  },
  {
    id: "neon-terminus",
    label: "Neon Terminus",
    tokens: {
      bg: "#0b0d12",
      panel: "#121622",
      panelSoft: "#171d2a",
      border: "#24304f",
      text: "#e8f7ff",
      muted: "#7ba6bb",
      accent: "#00f0ff",
      shadow: "rgba(0, 0, 0, 0.24)",
      heading: "#ffffff",
      editorBg: "#101722",
      sidebarBg: "#101520",
    },
    graph: {
      node: "#00f0ff",
      edge: "#3c5e78",
      label: "#e8f7ff",
    },
    typography: {
      bodyFont: bodyFontOptions[3].value,
      headingFont: headingFontOptions[0].value,
      editorScale: 101,
    },
  },
  {
    id: "venus",
    label: "Venus",
    tokens: {
      bg: "#2a1722",
      panel: "#351d2a",
      panelSoft: "#442433",
      border: "#8e5670",
      text: "#f9e7eb",
      muted: "#c999aa",
      accent: "#ff8a65",
      shadow: "rgba(20, 4, 12, 0.26)",
      heading: "#fff1f0",
      editorBg: "#311b27",
      sidebarBg: "#341d29",
    },
    graph: {
      node: "#ff8a65",
      edge: "#9f6a7f",
      label: "#f9e7eb",
    },
    typography: {
      bodyFont: bodyFontOptions[0].value,
      headingFont: headingFontOptions[1].value,
      editorScale: 102,
    },
  },
  {
    id: "sea-glass",
    label: "Sea Glass",
    tokens: {
      bg: "#e7f5f2",
      panel: "#d5ece7",
      panelSoft: "#f2fbf8",
      border: "#8abfb5",
      text: "#153b3b",
      muted: "#5e8381",
      accent: "#2aa79b",
      shadow: "rgba(50, 118, 111, 0.14)",
      heading: "#0e5250",
      editorBg: "#f6fdfb",
      sidebarBg: "#d0ebe5",
    },
    graph: {
      node: "#2aa79b",
      edge: "#78aba2",
      label: "#153b3b",
    },
    typography: {
      bodyFont: bodyFontOptions[0].value,
      headingFont: headingFontOptions[1].value,
      editorScale: 100,
    },
  },
  {
    id: "neptune",
    label: "Neptune",
    tokens: {
      bg: "#09131f",
      panel: "#0f1c2d",
      panelSoft: "#14263d",
      border: "#244767",
      text: "#dbeeff",
      muted: "#7ea3c3",
      accent: "#4aa7ff",
      shadow: "rgba(0, 0, 0, 0.28)",
      heading: "#f2f8ff",
      editorBg: "#0d1827",
      sidebarBg: "#0d1a2a",
    },
    graph: {
      node: "#4aa7ff",
      edge: "#3a668f",
      label: "#dbeeff",
    },
    typography: {
      bodyFont: bodyFontOptions[3].value,
      headingFont: headingFontOptions[0].value,
      editorScale: 101,
    },
  },
  {
    id: "horror",
    label: "Horror",
    tokens: {
      bg: "#120d12",
      panel: "#1a1219",
      panelSoft: "#221720",
      border: "#4d2733",
      text: "#eee5e7",
      muted: "#ab8e95",
      accent: "#bb3248",
      shadow: "rgba(0, 0, 0, 0.32)",
      heading: "#fff0f2",
      editorBg: "#171017",
      sidebarBg: "#181118",
    },
    graph: {
      node: "#bb3248",
      edge: "#6f3a46",
      label: "#eee5e7",
    },
    typography: {
      bodyFont: bodyFontOptions[1].value,
      headingFont: headingFontOptions[2].value,
      editorScale: 103,
    },
  },
];

export function getThemeDefinition(themeId: ThemeName) {
  return themes.find((theme) => theme.id === themeId) ?? themes[0];
}

function resolveTokens(
  base: ThemeTokens,
  overrides: Partial<ThemeTokens>,
): ThemeTokens {
  return { ...base, ...overrides };
}

function resolveGraph(
  base: GraphThemeTokens,
  overrides: Partial<GraphThemeTokens>,
): GraphThemeTokens {
  return { ...base, ...overrides };
}

function resolveTypography(
  base: TypographyThemeSettings,
  overrides: Partial<TypographyThemeSettings>,
): TypographyThemeSettings {
  return { ...base, ...overrides };
}

export function resolveTheme(
  themeId: ThemeName,
  customization: ThemeCustomization,
): ResolvedTheme {
  const baseTheme = getThemeDefinition(themeId);

  return {
    id: baseTheme.id,
    label: baseTheme.label,
    tokens: resolveTokens(baseTheme.tokens, customization.tokens),
    graph: resolveGraph(baseTheme.graph, customization.graph),
    typography: resolveTypography(baseTheme.typography, customization.typography),
  };
}

export function themeToCssVariables(theme: ResolvedTheme) {
  return {
    "--bg": theme.tokens.bg,
    "--panel": theme.tokens.panel,
    "--panel-soft": theme.tokens.panelSoft,
    "--border": theme.tokens.border,
    "--text": theme.tokens.text,
    "--muted": theme.tokens.muted,
    "--accent": theme.tokens.accent,
    "--shadow": theme.tokens.shadow,
    "--heading": theme.tokens.heading,
    "--editor-bg": theme.tokens.editorBg,
    "--sidebar-bg": theme.tokens.sidebarBg,
    "--graph-node": theme.graph.node,
    "--graph-edge": theme.graph.edge,
    "--graph-label": theme.graph.label,
    "--font-body": theme.typography.bodyFont,
    "--font-heading": theme.typography.headingFont,
    "--editor-font-scale": String(theme.typography.editorScale),
  } as Record<string, string>;
}
