import { themes } from "../app/themes";
import { useThemeStore } from "../stores/themeStore";
import { CreateVault } from "../features/vault/CreateVault";
import { VaultLauncher } from "../features/vault/VaultLauncher";
import { useVaultStore } from "../stores/vaultStore";


export function AppShell() {
  const { activeTheme, setTheme } = useThemeStore();
  const activeVault = useVaultStore((s)=> s.activeVault);
  const recentVaults = useVaultStore((s)=>s.recentVaults);


  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>Vaults</h2>

        {activeVault? (
            <p>{activeVault.name}</p>
        ):(<p> No Open Vault </p>)}
        <hr />
        <h3> Recent </h3>
        





        {recentVaults.map((vault) => (
  <p
    key={vault.path}
    onClick={() => setActiveVault(vault)}
    style={{ cursor: "pointer" }}
  >
    {vault.name}
  </p>
))}



      </aside>

      <main className="main-content">
        <header className="topbar">
          <span>VaultKeeper</span>

          <select
            value={activeTheme}
            onChange={(e) => setTheme(e.target.value as any)}
          >
            {themes.map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.label}
              </option>
            ))}
          </select>
        </header>

        <section className="workspace">
          <CreateVault/>
          <VaultLauncher/>
        </section>

        
      </main>

      <aside className="details-panel">Details</aside>
    </div>
  );
}
