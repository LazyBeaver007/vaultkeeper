import { invoke } from "@tauri-apps/api/core";
import type { VaultMeta, VaultState } from "../../types/vault";

export async function openVaultAtPath(path: string): Promise<VaultState> {
  const json = await invoke<string>("open_vault", { path });
  const meta = JSON.parse(json) as VaultMeta;

  return {
    path,
    ...meta,
  };
}
