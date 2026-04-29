import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useVaultStore } from "../../stores/vaultStore";

export function VaultLauncher() {
  const [path, setPath] = useState("D:\\Projects\\Eldoria");
  const [status, setStatus] = useState("");

  const setActiveVault = useVaultStore((s) => s.setActiveVault);

  async function openVault() {
    try {
      const json = await invoke<string>("open_vault", { path });
      const meta = JSON.parse(json);

      setActiveVault({
        path,
        ...meta,
      });

      setStatus("Vault opened");
    } catch (err) {
      setStatus(String(err));
    }
  }

  return (
    <div>
      <h2>Open Vault</h2>

      <input
        value={path}
        onChange={(e) => setPath(e.target.value)}
      />

      <button onClick={openVault}>Open</button>

      <p>{status}</p>
    </div>
  );
}
