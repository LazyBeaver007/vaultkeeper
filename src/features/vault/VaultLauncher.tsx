import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useVaultStore } from "../../stores/vaultStore";
import { open } from '@tauri-apps/plugin-dialog';


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

  async function pickFolder()
  {
      const  selected = await open(
          {
              directory: true,
          }
      );

      if(selected)
          {
              setPath(selected as string);
          }
  }

  return (
    <div className="tool-card">
      <h2 className="tool-title">Open Vault</h2>

      <input
        className="field"
        value={path}
        onChange={(e) => setPath(e.target.value)}
      />

      <div className="button-row">
        <button type="button" onClick={openVault}>
          Open
        </button>
        <button type="button" onClick={pickFolder}>
          Browse
        </button>
      </div>

      {status ? <p className="status-text">{status}</p> : null}
    </div>
  );
}
