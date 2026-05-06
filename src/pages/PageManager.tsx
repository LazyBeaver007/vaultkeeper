import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useVaultStore } from "../stores/vaultStore";
import { usePageStore } from "../stores/pageStore";
import { extractLinks } from "../utils/extractLinks"
import { useBacklinkStore } from "../stores/backLinkStore";


export function PageManager() {
  const vault = useVaultStore((s) => s.activeVault);
  const { pages, setPages, setActivePage } = usePageStore();

  const setBacklinks = useBacklinkStore((s) => s.setBackLinks);

  async function computeBacklinks(targetPage: string) {
  if (!vault) return;

  const linkedFrom: string[] = [];

  for (const file of pages) {
    const raw = await invoke<string>("read_page", {
      vaultPath: vault.path,
      fileName: file,
    });

    const json = JSON.parse(raw);

    const links = extractLinks(json.content);

    if (links.includes(targetPage.replace(".vkp", ""))) {
      linkedFrom.push(file.replace(".vkp", ""));
    }
  }

  setBacklinks(linkedFrom);
}



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
    computeBacklinks(file);
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
