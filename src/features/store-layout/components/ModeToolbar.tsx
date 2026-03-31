import type { PlacementMode } from "./LayoutGrid";
import "./ModeToolbar.css";

interface ModeToolbarProps {
  placementMode: PlacementMode;
  onPlacementModeChange: (mode: PlacementMode) => void;
  disabled?: boolean;
}

export default function ModeToolbar({
  placementMode,
  onPlacementModeChange,
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

  return (
    <div className="mode-toolbar">
      <div className="mode-toolbar__group">
        <span className="mode-toolbar__label">Place:</span>
        {modeBtn("zone", "Zone", "🔲")}
        {modeBtn("fixture", "Fixture", "📌")}
      </div>
    </div>
  );
}
