import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export function CreateVault() {
  const [basePath, setBasePath] = useState("D:\\Projects");
  const [vaultName, setVaultName] = useState("");
  const [status, setStatus] = useState("");

  async function handleCreate() {
    try {
      const result = await invoke<string>("create_vault", {
        basePath,
        vaultName,
      });

      setStatus(`Created: ${result}`);
    } catch (error) {
      setStatus(String(error));
    }
  }

  return (
    <div className="tool-card">
      <h2 className="tool-title">Create Vault</h2>

      <input
        className="field"
        placeholder="Base Path"
        value={basePath}
        onChange={(e) => setBasePath(e.target.value)}
      />

      <input
        className="field"
        placeholder="Vault Name"
        value={vaultName}
        onChange={(e) => setVaultName(e.target.value)}
      />

      <button type="button" onClick={handleCreate}>
        Create
      </button>

      {status ? <p className="status-text">{status}</p> : null}
    </div>
  );
}
