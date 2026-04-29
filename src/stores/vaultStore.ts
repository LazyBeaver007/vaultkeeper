import { create } from "zustand";
import type {VaultState} from "../types/vault";


interface Store 
{
    activeVault: VaultState | null;
    recentVaults: VaultState[];
    setActiveVault: (vault: VaultState) => void;
}

export const useVaultStore = create<Store>((set)=>
                                          (
                                              {
                                                  activeVault: null,
                                                  recentVaults: [],
                                                  setActiveVault: (vault) => 
                                                  set((state)=> 

                                                     ({
                                                         activeVault:vault,
                                                         recentVaults: [vault, ...state.recentVaults.filter((v)=>v.path !== vault.path),].slice(0,8),
                                                     })
                                                     ),
                                              }
                                          ))
