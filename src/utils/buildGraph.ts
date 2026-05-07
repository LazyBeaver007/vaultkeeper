import { extractLinks } from "./extractLinks";

export function buildGraph(pages: any[]) {
  const nodes: any[] = [];
  const edges: any[] = [];
  const pageCount = pages.length;
  const radius = Math.max(180, pageCount * 55);

  for (const [index, page] of pages.entries()) {
    const angle = pageCount > 1 ? (index / pageCount) * Math.PI * 2 : 0;

    nodes.push({
      data: {
        id: page.title,
        label: page.title,
      },
      position: {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      },
    });

    const links = extractLinks(page.content);

    for (const link of links) {
      edges.push({
        data: {
          source: page.title,
          target: link,
        },
      });
    }
  }

  return [...nodes, ...edges];
}
