import type { PointerEvent } from "react";

interface PanelResizeHandleProps {
  side: "left" | "right";
  collapsed: boolean;
  onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void;
  onToggle: () => void;
}

export function PanelResizeHandle({
  side,
  collapsed,
  onPointerDown,
  onToggle,
}: PanelResizeHandleProps) {
  const direction = side === "left"
    ? collapsed ? "»" : "«"
    : collapsed ? "«" : "»";

  return (
    <div className={`panel-handle panel-handle-${side}`}>
      <button
        type="button"
        className="panel-handle-hitbox"
        aria-label={collapsed ? `Expand ${side} panel` : `Resize ${side} panel`}
        onPointerDown={onPointerDown}
      />
      <button
        type="button"
        className="panel-toggle"
        aria-label={collapsed ? `Expand ${side} panel` : `Collapse ${side} panel`}
        onClick={onToggle}
      >
        {direction}
      </button>
    </div>
  );
}
