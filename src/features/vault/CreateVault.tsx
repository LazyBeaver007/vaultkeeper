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
    <div>
      <h2>Create Vault</h2>

      <input
        placeholder="Base Path"
        value={basePath}
        onChange={(e) => setBasePath(e.target.value)}
      />

      <input
        placeholder="Vault Name"
        value={vaultName}
        onChange={(e) => setVaultName(e.target.value)}
      />

      <button onClick={handleCreate}>Create</button>

      <p>{status}</p>
    </div>
  );
}
