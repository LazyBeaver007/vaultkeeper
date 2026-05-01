import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useVaultStore } from "../../stores/vaultStore";
import { usePageStore } from "../../stores/pageStore";

export function CreatePage() {
  const vault = useVaultStore((s) => s.activeVault);
  const setPages = usePageStore((s) => s.setPages);

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");

  async function createPage() {
    if (!vault || !title) return;

    try {
      await invoke("create_page", {
        vaultPath: vault.path,
        title,
      });

      const result = await invoke<string[]>("list_pages", {
        vaultPath: vault.path,
      });

      setPages(result);
      setTitle("");
      setStatus("Created");
    } catch (err) {
      setStatus(String(err));
    }
  }

  return (
    <div className="tool-card">
      <h3 className="tool-title">Create Page</h3>

      <input
        className="field"
        placeholder="Page title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <button type="button" onClick={createPage}>
        Create
      </button>

      {status ? <p className="status-text">{status}</p> : null}
    </div>
  );
}
