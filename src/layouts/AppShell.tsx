import { themes } from "../app/themes";
import { useThemeStore } from "../stores/themeStore";
import { CreateVault } from "../features/vault/CreateVault";

export function AppShell() {
  const { activeTheme, setTheme } = useThemeStore();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>Vaults</h2>
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
        </section>

        
      </main>

      <aside className="details-panel">Details</aside>
    </div>
  );
}
