import {AppShell} from "../layouts/AppShell"
import { useThemeStore } from "../stores/themeStore"
import { useEffect } from "react";
import { useVaultStore } from "../stores/vaultStore";
import { resolveTheme, themeToCssVariables } from "./themes";
import { openVaultAtPath } from "../features/vault/openVault";

export default function App() 
{
    const activeTheme = useThemeStore((state)=>state.activeTheme);
    const customization = useThemeStore((state) => state.customization);
    const recentVaults = useVaultStore((s) => s.recentVaults);
    const setActiveVault = useVaultStore((s) => s.setActiveVault);
    const resolvedTheme = resolveTheme(activeTheme, customization);

    useEffect(()=>
              {
                  if (!recentVaults.length) return;

                  void openVaultAtPath(recentVaults[0].path).then(setActiveVault).catch(() => {
                    // Ignore stale recent vaults on boot and let the launcher recover.
                  });
              },[]);


    return (
        <div
          data-theme={activeTheme}
          style={themeToCssVariables(resolvedTheme)}
        >
        <AppShell/>
        </div>
    );
}


