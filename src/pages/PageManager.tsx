import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useVaultStore } from "../stores/vaultStore";
import { usePageStore } from "../stores/pageStore";

export function PageManager() {
  const vault = useVaultStore((s) => s.activeVault);
  const { pages, setPages, setActivePage } = usePageStore();

  async function loadPages() {
    if (!vault) return;

    const result = await invoke<string[]>("list_pages", {
      vaultPath: vault.path,
    });

    setPages(result);
  }

  async function openPage(file: string) {
    if (!vault) return;

    const data = await invoke<string>("read_page", {
      vaultPath: vault.path,
      fileName: file,
    });

    setActivePage({
      ...JSON.parse(data),
      fileName: file,
    });
  }

  useEffect(() => {
    loadPages();
  }, [vault]);

  return (
    <div className="page-manager">
      {!vault ? (
        <p className="empty-state">Open a vault to view pages.</p>
      ) : pages.length ? (
        <ul className="page-list">
          {pages.map((p) => (
            <li key={p}>
              <button
                className="page-link"
                type="button"
                onClick={() => openPage(p)}
              >
                {p.replace(/\.vkp$/, "")}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state">No pages yet. Create one from the right panel.</p>
      )}
    </div>
  );
}
