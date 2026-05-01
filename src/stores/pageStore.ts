import { create } from "zustand";
import type { PageDocument } from "../types/page";

interface PageState {
  pages: string[];
  activePage: PageDocument | null;
  setPages: (pages: string[]) => void;
  setActivePage: (page: PageDocument | null) => void;
  updateActivePageContent: (content: string) => void;
}

export const usePageStore = create<PageState>((set) => ({
  pages: [],
  activePage: null,
  setPages: (pages) => set({ pages }),
  setActivePage: (page) => set({ activePage: page }),
  updateActivePageContent: (content) =>
    set((state) => ({
      activePage: state.activePage
        ? { ...state.activePage, content }
        : null,
    })),
}));
