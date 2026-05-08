import { create } from "zustand";
import {
  getThemeDefinition,
  resolveTheme,
} from "../app/themes";
import type {
  GraphThemeTokens,
  ThemeCustomization,
  ThemeName,
  ThemeTokens,
  TypographyThemeSettings,
} from "../types/themes";

const STORAGE_KEY = "vaultkeeper_theme_settings";

interface ThemeState {
  activeTheme: ThemeName;
  customization: ThemeCustomization;
  setTheme: (theme: ThemeName) => void;
  updateThemeToken: <K extends keyof ThemeTokens>(
    key: K,
    value: ThemeTokens[K],
  ) => void;
  updateGraphToken: <K extends keyof GraphThemeTokens>(
    key: K,
    value: GraphThemeTokens[K],
  ) => void;
  updateTypography: <K extends keyof TypographyThemeSettings>(
    key: K,
    value: TypographyThemeSettings[K],
  ) => void;
  resetCustomization: () => void;
}

interface StoredThemeState {
  activeTheme: ThemeName;
  customization: ThemeCustomization;
}

function loadThemeState(): StoredThemeState {
  const fallback: StoredThemeState = {
    activeTheme: "codeon",
    customization: {
      tokens: {},
      graph: {},
      typography: {},
    },
  };

  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return fallback;
  }

  try {
    return {
      ...fallback,
      ...JSON.parse(raw),
    };
  } catch {
    return fallback;
  }
}

function persistThemeState(state: StoredThemeState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const initialState = loadThemeState();

export const useThemeStore = create<ThemeState>((set, get) => ({
  activeTheme: initialState.activeTheme,
  customization: initialState.customization,
  setTheme: (theme) => {
    const nextState = {
      activeTheme: theme,
      customization: get().customization,
    };

    persistThemeState(nextState);
    set({ activeTheme: theme });
  },
  updateThemeToken: (key, value) => {
    const customization = {
      ...get().customization,
      tokens: {
        ...get().customization.tokens,
        [key]: value,
      },
    };

    persistThemeState({
      activeTheme: get().activeTheme,
      customization,
    });

    set({ customization });
  },
  updateGraphToken: (key, value) => {
    const customization = {
      ...get().customization,
      graph: {
        ...get().customization.graph,
        [key]: value,
      },
    };

    persistThemeState({
      activeTheme: get().activeTheme,
      customization,
    });

    set({ customization });
  },
  updateTypography: (key, value) => {
    const customization = {
      ...get().customization,
      typography: {
        ...get().customization.typography,
        [key]: value,
      },
    };

    persistThemeState({
      activeTheme: get().activeTheme,
      customization,
    });

    set({ customization });
  },
  resetCustomization: () => {
    const baseTheme = getThemeDefinition(get().activeTheme);
    const customization = {
      tokens: {},
      graph: {},
      typography: {
        bodyFont: baseTheme.typography.bodyFont,
        headingFont: baseTheme.typography.headingFont,
        editorScale: baseTheme.typography.editorScale,
      },
    };

    persistThemeState({
      activeTheme: get().activeTheme,
      customization,
    });

    set({ customization });
  },
}));

export function getResolvedThemeState() {
  const { activeTheme, customization } = useThemeStore.getState();
  return resolveTheme(activeTheme, customization);
}
