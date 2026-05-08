export type ThemeName =
  | "codeon"
  | "cloud-glass"
  | "horror"
  | "medieval"
  | "venus"
  | "neptune"
  | "parchment"
  | "neon-terminus"
  | "sea-glass";

export interface ThemeTokens {
  bg: string;
  panel: string;
  panelSoft: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  shadow: string;
  heading: string;
  editorBg: string;
  sidebarBg: string;
}

export interface GraphThemeTokens {
  node: string;
  edge: string;
  label: string;
}

export interface TypographyThemeSettings {
  bodyFont: string;
  headingFont: string;
  editorScale: number;
}

export interface ThemeDefinition {
  id: ThemeName;
  label: string;
  tokens: ThemeTokens;
  graph: GraphThemeTokens;
  typography: TypographyThemeSettings;
}

export interface ThemeCustomization {
  tokens: Partial<ThemeTokens>;
  graph: Partial<GraphThemeTokens>;
  typography: Partial<TypographyThemeSettings>;
}

export interface ResolvedTheme {
  id: ThemeName;
  label: string;
  tokens: ThemeTokens;
  graph: GraphThemeTokens;
  typography: TypographyThemeSettings;
}
