import { create } from "zustand";
import type {VaultState} from "../types/vault";


const STORAGE_KEY = "vaultkeeper_recent";

function loadVaults(): VaultState[]
{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
}

interface Store 
{
    activeVault: VaultState | null;
    recentVaults: VaultState[];
    setActiveVault: (vault: VaultState) => void;
    removeRecentVault: (path: string) => void;
}

export const useVaultStore = create<Store>((set) => ({
  activeVault: null,
  recentVaults: loadVaults(),

  setActiveVault: (vault) =>
    set((state) => {
      const updated = [
        vault,
        ...state.recentVaults.filter((v) => v.path !== vault.path),
      ].slice(0, 8);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      return {
        activeVault: vault,
        recentVaults: updated,
      };
    }),
  removeRecentVault: (path) =>
    set((state) => {
      const recentVaults = state.recentVaults.filter((vault) => vault.path !== path);
      const activeVault =
        state.activeVault?.path === path ? null : state.activeVault;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentVaults));

      return {
        activeVault,
        recentVaults,
      };
    }),
}));
