import { useEffect, useState, type CSSProperties } from "react";
import { invoke } from "@tauri-apps/api/core";
import { themes } from "../app/themes";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { Editor } from "../features/editor/Editor";
import { CreatePage } from "../features/pages/CreatePage";
import { ThemeCustomizer } from "../features/themes/ThemeCustomizer";
import { CreateVault } from "../features/vault/CreateVault";
import { VaultLauncher } from "../features/vault/VaultLauncher";
import { PanelResizeHandle } from "./PanelResizeHandle";
import { PageManager } from "../pages/PageManager";
import { usePageStore } from "../stores/pageStore";
import { useThemeStore } from "../stores/themeStore";
import { panelLimits, useUiStore } from "../stores/uiStore";
import { useVaultStore } from "../stores/vaultStore";
import { useBacklinkStore } from "../stores/backLinkStore";
import { GraphContainer } from "../features/graph/GraphContainer";

export function AppShell() {
  const { activeTheme, setTheme } = useThemeStore();
  const activeVault = useVaultStore((s) => s.activeVault);
  const recentVaults = useVaultStore((s) => s.recentVaults);
  const setActiveVault = useVaultStore((s) => s.setActiveVault);
  const removeRecentVault = useVaultStore((s) => s.removeRecentVault);
  const activePage = usePageStore((s) => s.activePage);
  const updateActivePageContent = usePageStore((s) => s.updateActivePageContent);
  const setActivePage = usePageStore((s) => s.setActivePage);
  const pages = usePageStore((s) => s.pages);
  const backlinks = useBacklinkStore((s) => s.backlinks);
  const leftPanel = useUiStore((s) => s.leftPanel);
  const rightPanel = useUiStore((s) => s.rightPanel);
  const setPanelWidth = useUiStore((s) => s.setPanelWidth);
  const togglePanel = useUiStore((s) => s.togglePanel);
  const [isResizing, setIsResizing] = useState<"left" | "right" | null>(null);
  const [vaultToRemove, setVaultToRemove] = useState<{ name: string; path: string } | null>(null);
  const [viewMode, setViewMode] = useState<"editor" | "graph">("editor");

  async function savePage() {
    if (!activeVault || !activePage) return;

    await invoke("save_page", {
      vaultPath: activeVault.path,
      fileName: activePage.fileName,
      content: activePage.content,
    });

    const raw = await invoke<string>("read_page", {
      vaultPath: activeVault.path,
      fileName: activePage.fileName,
    });

    setActivePage({
      ...JSON.parse(raw),
      fileName: activePage.fileName,
    });
  }

  // Handle clicking on a wikilink to navigate to that page
  async function handleLinkClick(pageName: string) {
    if (!activeVault) return;

    const fileName = pageName.endsWith(".vkp") ? pageName : `${pageName}.vkp`;

    if (!pages.includes(fileName)) return;

    const raw = await invoke<string>("read_page", {
      vaultPath: activeVault.path,
      fileName,
    });

    setActivePage({
      ...JSON.parse(raw),
      fileName,
    });
  }

  useEffect(() => {
    if (!activePage || !activeVault) return;

    const timeout = setTimeout(() => {
      void invoke("save_page", {
        vaultPath: activeVault.path,
        fileName: activePage.fileName,
        content: activePage.content,
      });
    }, 800);

    return () => clearTimeout(timeout);
  }, [activePage?.content, activePage?.fileName, activeVault?.path]);

  useEffect(() => {
    if (!isResizing) {
      return;
    }

    function handlePointerMove(event: PointerEvent) {
      if (isResizing === "left") {
        setPanelWidth("left", event.clientX);
        return;
      }

      const nextWidth = window.innerWidth - event.clientX;
      setPanelWidth("right", nextWidth);
    }

    function handlePointerUp() {
      setIsResizing(null);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isResizing, setPanelWidth]);

  const shellStyle: CSSProperties = {
    "--left-panel-size": leftPanel.collapsed ? "0px" : `${leftPanel.width}px`,
    "--right-panel-size": rightPanel.collapsed ? "0px" : `${rightPanel.width}px`,
  } as CSSProperties;

  return (
    <div
      className={`app-shell${isResizing ? " is-resizing" : ""}`}
      style={shellStyle}
    >
      <aside className={`sidebar app-panel${leftPanel.collapsed ? " is-collapsed" : ""}`}>
        <section className="panel-section">
          <h2 className="section-title">Vaults</h2>
          <p className="current-vault">{activeVault ? activeVault.name : "No open vault"}</p>
        </section>

        <section className="panel-section">
          <h3 className="section-title">Recent</h3>

          {recentVaults.length ? (
            <div className="vault-list">
              {recentVaults.map((vault) => (
                <div key={vault.path} className="vault-row">
                  <button
                    className="vault-link"
                    type="button"
                    onClick={() => setActiveVault(vault)}
                  >
                    {vault.name}
                  </button>
                  <button
                    type="button"
                    className="page-action"
                    onClick={() => setVaultToRemove(vault)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No recent vaults</p>
          )}
        </section>

        <section className="panel-section panel-fill">
          <h3 className="section-title">Pages</h3>
          <PageManager />
        </section>
      </aside>

      <PanelResizeHandle
        side="left"
        collapsed={leftPanel.collapsed}
        onToggle={() => togglePanel("left")}
        onPointerDown={(event) => {
          event.preventDefault();
          if (leftPanel.collapsed) {
            setPanelWidth("left", panelLimits.left.default);
            return;
          }

          setIsResizing("left");
        }}
      />

      <main className="main-content">
        <header className="topbar">
          <span className="brand">VaultKeeper</span>

          <div className="topbar-actions">
            <button
              type="button"
              onClick={() =>
                setViewMode((current) =>
                  current === "editor" ? "graph" : "editor",
                )
              }
            >
              {viewMode === "editor" ? "Graph View" : "Editor View"}
            </button>

            <select
              value={activeTheme}
              onChange={(e) => setTheme(e.target.value as typeof activeTheme)}
            >
              {themes.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.label}
                </option>
              ))}
            </select>
          </div>
        </header>

        <section className="workspace">
          {viewMode === "graph" ? (
            activeVault ? (
              <article className="page-view">
                <div className="page-view-header">
                  <h1>Graph View</h1>
                </div>
                <GraphContainer />
              </article>
            ) : (
              <div className="workspace-empty">Open a vault to view the graph</div>
            )
          ) : activePage ? (
            <article className="page-view">
              <div className="page-view-header">
                <h1>{activePage.title}</h1>
                <button type="button" onClick={savePage}>
                  Save Page
                </button>
              </div>

              <Editor
                key={activePage.fileName}
                pageId={activePage.fileName}
                content={activePage.content}
                onChange={(html) => {
                  updateActivePageContent(html);
                }}
                onLinkClick={handleLinkClick}
              />
            </article>
          ) : (
            <div className="workspace-empty">Select a page to begin editing</div>
          )}
        </section>
      </main>

      <PanelResizeHandle
        side="right"
        collapsed={rightPanel.collapsed}
        onToggle={() => togglePanel("right")}
        onPointerDown={(event) => {
          event.preventDefault();
          if (rightPanel.collapsed) {
            setPanelWidth("right", panelLimits.right.default);
            return;
          }

          setIsResizing("right");
        }}
      />

      <aside className={`details-panel app-panel${rightPanel.collapsed ? " is-collapsed" : ""}`}>
        <div className="details-content">
          <section className="panel-section">
            <h2 className="section-title">Details</h2>

            {activePage && (
              <>
                <p>{activePage.title}</p>

                <hr />

                <h3 className="section-title">Linked From</h3>

                {backlinks.length ? (
                  backlinks.map((b) => (
                    <p key={b}>{b}</p>
                  ))
                ) : (
                  <p>No backlinks</p>
                )}
              </>
            )}
          </section>

          <section className="panel-section">
            <CreateVault />
          </section>

          <section className="panel-section">
            <VaultLauncher />
          </section>

          <section className="panel-section">
            <CreatePage />
          </section>

          <section className="panel-section">
            <ThemeCustomizer />
          </section>
        </div>
      </aside>

      <ConfirmationDialog
        open={Boolean(vaultToRemove)}
        title="Remove Vault From Launcher?"
        description={
          vaultToRemove
            ? `"${vaultToRemove.name}" will be removed from your recent vaults list, but all files stay untouched on disk.`
            : ""
        }
        confirmLabel="Remove From Launcher"
        onCancel={() => setVaultToRemove(null)}
        onConfirm={() => {
          if (vaultToRemove) {
            removeRecentVault(vaultToRemove.path);
          }
          setVaultToRemove(null);
        }}
      />
    </div>
  );
}
