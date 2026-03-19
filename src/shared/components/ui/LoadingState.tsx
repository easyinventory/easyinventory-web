import "./LoadingState.css";

interface LoadingStateProps {
  text?: string;
}

export default function LoadingState({ text = "Loading..." }: LoadingStateProps) {
  return <div className="loading-state">{text}</div>;
}
