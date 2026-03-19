import { memo } from "react";
import "./LoadingState.css";

interface LoadingStateProps {
  text?: string;
}

export default memo(function LoadingState({ text = "Loading..." }: LoadingStateProps) {
  return <div className="loading-state">{text}</div>;
});
