import { useEffect, useRef } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import { resolveTheme } from "../../app/themes";
import { useThemeStore } from "../../stores/themeStore";

interface Props
{
    elements: any[];
    onNodeClick: (id: string) => void;
}

export function GraphView({ elements, onNodeClick }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cyRef = useRef<any>(null);
  const activeTheme = useThemeStore((state) => state.activeTheme);
  const customization = useThemeStore((state) => state.customization);
  const graphTheme = resolveTheme(activeTheme, customization).graph;

  useEffect(() => {
    const container = containerRef.current;
    const cy = cyRef.current;

    if (!container || !cy) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      const currentZoom = cy.zoom();
      const factor = event.deltaY > 0 ? 0.92 : 1.08;
      const nextZoom = Math.max(0.35, Math.min(1.8, currentZoom * factor));
      const rect = container.getBoundingClientRect();

      cy.zoom({
        level: nextZoom,
        renderedPosition: {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        },
      });
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [elements]);

  return (
    <div ref={containerRef} style={{ height: "560px", marginTop: "0.75rem" }}>
      <CytoscapeComponent
        elements={elements}
        style={{
          width: "100%",
          height: "100%",
        }}
        layout={{
          name: "preset",
          fit: false,
          animate: false,
          padding: 140,
        }}
        cy={(cy: any) => {
          cyRef.current = cy;

          const resetViewport = () => {
            const graphElements = cy.elements();

            if (!graphElements.length) return;

            cy.fit(graphElements, 140);

            if (cy.zoom() > 1) {
              cy.zoom(1);
            }

            if (cy.zoom() < 0.45) {
              cy.zoom(0.45);
            }

            cy.center();
          };

          cy.zoomingEnabled(true);
          cy.userZoomingEnabled(true);
          cy.panningEnabled(true);
          cy.userPanningEnabled(true);
          cy.boxSelectionEnabled(false);
          cy.autoungrabify(false);
          cy.autounselectify(true);
          cy.minZoom(0.35);
          cy.maxZoom(1.8);
          cy.on("tap", "node", (evt: any) => {
            onNodeClick(evt.target.id());
          });
          cy.ready(resetViewport);
          setTimeout(resetViewport, 0);
        }}
        stylesheet={[
          {
            selector: "node",
            style: {
              label: "data(label)",
              "background-color": graphTheme.node,
              width: 26,
              height: 26,
              "font-size": 9,
              "text-max-width": 72,
              "text-wrap": "ellipsis",
              color: graphTheme.label,
              "text-valign": "bottom",
              "text-halign": "center",
              "text-margin-y": 10,
              "overlay-opacity": 0,
            },
          },
          {
            selector: "edge",
            style: {
              width: 1,
              "line-color": graphTheme.edge,
              "target-arrow-color": graphTheme.edge,
              "arrow-scale": 0.7,
              "target-arrow-shape": "triangle",
              "curve-style": "bezier",
              opacity: 0.8,
            },
          },
        ]}
      />
    </div>
  );
}
