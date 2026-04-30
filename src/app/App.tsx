import {AppShell} from "../layouts/AppShell"
import { useThemeStore } from "../stores/themeStore"
import { useEffect } from "react";
import { useVaultStore } from "../stores/vaultStore";

export default function App() 
{
    const activeTheme = useThemeStore((state)=>state.activeTheme);
    const recentVaults = useVaultStore((s) => s.recentVaults);
    const setActiveVault = useVaultStore((s) => s.setActiveVault);

    useEffect(()=>
              {
                  if (!recentVaults.length) return;

                  setActiveVault(recentVaults[0]);
              },[]);


    return (
        <div data-theme={activeTheme}>
        <AppShell/>
        </div>
    );
}


