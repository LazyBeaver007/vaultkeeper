import { create } from "zustand";

type PanelSide = "left" | "right";

interface PanelState {
  width: number;
  collapsed: boolean;
}

interface LayoutState {
  leftPanel: PanelState;
  rightPanel: PanelState;
  setPanelWidth: (side: PanelSide, width: number) => void;
  togglePanel: (side: PanelSide) => void;
  setPanelCollapsed: (side: PanelSide, collapsed: boolean) => void;
}

const STORAGE_KEY = "vaultkeeper_layout";

const PANEL_LIMITS = {
  left: {
    min: 240,
    max: 420,
    default: 280,
  },
  right: {
    min: 280,
    max: 460,
    default: 340,
  },
} as const;

function clampWidth(side: PanelSide, width: number) {
  const config = PANEL_LIMITS[side];
  return Math.min(config.max, Math.max(config.min, width));
}

function loadLayoutState() {
  const fallback = {
    leftPanel: {
      width: PANEL_LIMITS.left.default,
      collapsed: false,
    },
    rightPanel: {
      width: PANEL_LIMITS.right.default,
      collapsed: false,
    },
  };

  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw);

    return {
      leftPanel: {
        width: clampWidth("left", parsed.leftPanel?.width ?? fallback.leftPanel.width),
        collapsed: Boolean(parsed.leftPanel?.collapsed),
      },
      rightPanel: {
        width: clampWidth("right", parsed.rightPanel?.width ?? fallback.rightPanel.width),
        collapsed: Boolean(parsed.rightPanel?.collapsed),
      },
    };
  } catch {
    return fallback;
  }
}

function persistLayoutState(state: Pick<LayoutState, "leftPanel" | "rightPanel">) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const initialState = loadLayoutState();

export const panelLimits = PANEL_LIMITS;

export const useUiStore = create<LayoutState>((set, get) => ({
  leftPanel: initialState.leftPanel,
  rightPanel: initialState.rightPanel,
  setPanelWidth: (side, width) => {
    const nextState =
      side === "left"
        ? {
            leftPanel: {
              ...get().leftPanel,
              width: clampWidth(side, width),
              collapsed: false,
            },
            rightPanel: get().rightPanel,
          }
        : {
            leftPanel: get().leftPanel,
            rightPanel: {
              ...get().rightPanel,
              width: clampWidth(side, width),
              collapsed: false,
            },
          };

    persistLayoutState(nextState);
    set(nextState);
  },
  togglePanel: (side) => {
    const nextState =
      side === "left"
        ? {
            leftPanel: {
              ...get().leftPanel,
              collapsed: !get().leftPanel.collapsed,
            },
            rightPanel: get().rightPanel,
          }
        : {
            leftPanel: get().leftPanel,
            rightPanel: {
              ...get().rightPanel,
              collapsed: !get().rightPanel.collapsed,
            },
          };

    persistLayoutState(nextState);
    set(nextState);
  },
  setPanelCollapsed: (side, collapsed) => {
    const nextState =
      side === "left"
        ? {
            leftPanel: {
              ...get().leftPanel,
              collapsed,
            },
            rightPanel: get().rightPanel,
          }
        : {
            leftPanel: get().leftPanel,
            rightPanel: {
              ...get().rightPanel,
              collapsed,
            },
          };

    persistLayoutState(nextState);
    set(nextState);
  },
}));
