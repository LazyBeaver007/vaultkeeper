import { create } from "zustand";
import type { PageDocument } from "../types/page";

interface PageState {
  pages: string[];
  activePage: PageDocument | null;
  setPages: (pages: string[]) => void;
  setActivePage: (page: PageDocument | null) => void;
  updateActivePageContent: (content: string) => void;
  removePage: (fileName: string) => void;
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
  removePage: (fileName) =>
    set((state) => ({
      pages: state.pages.filter((page) => page !== fileName),
      activePage:
        state.activePage?.fileName === fileName ? null : state.activePage,
    })),
}));
