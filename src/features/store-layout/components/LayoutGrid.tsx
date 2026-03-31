import { memo } from "react";
import "./LayoutGrid.css";

interface LayoutGridProps {
  rows: number;
  cols: number;
}

const LayoutGrid = memo(function LayoutGrid({ rows, cols }: LayoutGridProps) {
  const cellCount = rows * cols;

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
      {Array.from({ length: cellCount }, (_, i) => (
        <div key={i} className="layout-grid__cell" />
      ))}
    </div>
  );
});

export default LayoutGrid;
