import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { useVaultStore } from "../stores/vaultStore";
import { usePageStore } from "../stores/pageStore";
import { extractLinks } from "../utils/extractLinks";
import { useBacklinkStore } from "../stores/backLinkStore";
import type { DeletePagePreview } from "../types/deletion";


export function PageManager() {
  const vault = useVaultStore((s) => s.activeVault);
  const activePage = usePageStore((s) => s.activePage);
  const pages = usePageStore((s) => s.pages);
  const setPages = usePageStore((s) => s.setPages);
  const setActivePage = usePageStore((s) => s.setActivePage);
  const removePage = usePageStore((s) => s.removePage);

  const setBacklinks = useBacklinkStore((s) => s.setBackLinks);
  const [deleteTarget, setDeleteTarget] = useState<DeletePagePreview | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function computeBacklinks(targetPage: string) {
    if (!vault) return [];

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

    return linkedFrom;
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
    const backlinks = await computeBacklinks(file);
    setBacklinks(backlinks);
  }

  async function requestDelete(fileName: string) {
    const backlinks = await computeBacklinks(fileName);

    setDeleteTarget({
      fileName,
      title: fileName.replace(/\.vkp$/, ""),
      backlinks,
    });
  }

  async function confirmDelete() {
    if (!vault || !deleteTarget) {
      return;
    }

    setIsDeleting(true);

    try {
      await invoke("trash_page", {
        vaultPath: vault.path,
        fileName: deleteTarget.fileName,
      });

      removePage(deleteTarget.fileName);

      if (activePage?.fileName === deleteTarget.fileName) {
        setBacklinks([]);
      }

      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
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
            <li key={p} className="page-row">
              <button
                className="page-link"
                type="button"
                onClick={() => openPage(p)}
              >
                {p.replace(/\.vkp$/, "")}
              </button>
              <button
                className="page-action"
                type="button"
                aria-label={`Delete ${p.replace(/\.vkp$/, "")}`}
                onClick={() => {
                  void requestDelete(p);
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state">No pages yet. Create one from the right panel.</p>
      )}

      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        title="Move Page To Trash?"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" will be moved to this vault's trash instead of being permanently deleted.`
            : ""
        }
        warning={
          deleteTarget?.backlinks.length
            ? "This page is still referenced elsewhere in your vault."
            : undefined
        }
        details={deleteTarget?.backlinks.map((backlink) => `Linked from ${backlink}`) ?? []}
        confirmLabel="Move To Trash"
        isDestructive
        isBusy={isDeleting}
        onCancel={() => {
          if (!isDeleting) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={() => {
          void confirmDelete();
        }}
      />
    </div>
  );
}
