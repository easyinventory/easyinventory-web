import { memo } from "react";
import "./LayoutGrid.css";

interface LayoutGridProps {
  rows: number;
  cols: number;
  showCoords?: boolean;
}

const LayoutGrid = memo(function LayoutGrid({
  rows,
  cols,
  showCoords = true,
}: LayoutGridProps) {
  return (
    <div
      className="layout-grid"
      style={
        {
          "--layout-cols": cols,
          "--layout-rows": rows,
        } as React.CSSProperties
      }
    >
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => (
          <div key={`${r}-${c}`} className="layout-grid__cell">
            {showCoords && (
              <span className="layout-grid__cell-coord">
                {r + 1},{c + 1}
              </span>
            )}
          </div>
        ))
      )}
    </div>
  );
});

export default LayoutGrid;
