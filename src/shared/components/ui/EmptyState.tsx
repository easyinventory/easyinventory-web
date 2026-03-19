import { memo, type ReactNode } from "react";
import "./EmptyState.css";

interface EmptyStateProps {
  message: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export default memo(function EmptyState({ message, icon, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state__icon">{icon}</div>}
      <div className="empty-state__message">{message}</div>
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
});
