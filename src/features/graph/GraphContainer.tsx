import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useVaultStore } from "../../stores/vaultStore";
import { usePageStore } from "../../stores/pageStore";
import { buildGraph } from "../../utils/buildGraph";
import { GraphView } from "./GraphView";

export function GraphContainer() {
  const vault = useVaultStore((s) => s.activeVault);
  const pages = usePageStore((s) => s.pages);
  const setActivePage = usePageStore((s) => s.setActivePage);

  const [elements, setElements] = useState<any[]>([]);

  useEffect(() => {
    loadGraph();
  }, [pages]);

  async function loadGraph() {
    if (!vault) return;

    const loadedPages = [];

    for (const file of pages) {
      const raw = await invoke<string>("read_page", {
        vaultPath: vault.path,
        fileName: file,
      });

      loadedPages.push(JSON.parse(raw));
    }

    setElements(buildGraph(loadedPages));
  }

  async function openNode(title: string) {
    if (!vault) return;

    const fileName = title + ".vkp";

    const raw = await invoke<string>("read_page", {
      vaultPath: vault.path,
      fileName,
    });

    setActivePage({
      ...JSON.parse(raw),
      fileName,
    });
  }

  return (
    <GraphView
      elements={elements}
      onNodeClick={openNode}
    />
  );
}
