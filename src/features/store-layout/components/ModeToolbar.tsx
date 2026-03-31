import type { PlacementMode, DrawMode } from "./LayoutGrid";
import "./ModeToolbar.css";

interface ModeToolbarProps {
  placementMode: PlacementMode;
  drawMode: DrawMode;
  onPlacementModeChange: (mode: PlacementMode) => void;
  onDrawModeChange: (mode: DrawMode) => void;
  disabled?: boolean;
}

export default function ModeToolbar({
  placementMode,
  drawMode,
  onPlacementModeChange,
  onDrawModeChange,
  disabled = false,
}: ModeToolbarProps) {
  function modeBtn(
    mode: PlacementMode,
    label: string,
    icon: string,
  ) {
    const isActive = placementMode === mode;
    return (
      <button
        className={`mode-toolbar__btn${isActive ? " mode-toolbar__btn--active" : ""}`}
        onClick={() => onPlacementModeChange(isActive ? "none" : mode)}
        disabled={disabled}
      >
        {icon} {label}
      </button>
    );
  }

  function drawBtn(mode: DrawMode, label: string, icon: string) {
    const isActive = drawMode === mode;
    return (
      <button
        className={`mode-toolbar__btn${isActive ? " mode-toolbar__btn--active" : ""}`}
        onClick={() => onDrawModeChange(mode)}
        disabled={disabled || placementMode === "none"}
      >
        {icon} {label}
      </button>
    );
  }

  return (
    <div className="mode-toolbar">
      <div className="mode-toolbar__group">
        <span className="mode-toolbar__label">Place:</span>
        {modeBtn("zone", "Zone", "🔲")}
        {modeBtn("fixture", "Fixture", "📌")}
      </div>
      <div className="mode-toolbar__divider" />
      <div className="mode-toolbar__group">
        <span className="mode-toolbar__label">Draw:</span>
        {drawBtn("rectangle", "Rectangle", "▭")}
        {drawBtn("freeform", "Freeform", "✏️")}
      </div>
    </div>
  );
}
