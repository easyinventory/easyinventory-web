import { memo } from "react";
import { Link } from "react-router-dom";
import "./PageHeader.css";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: { label: string; path: string; state?: Record<string, unknown> };
  children?: React.ReactNode;
}

export default memo(function PageHeader({
  title,
  subtitle,
  backTo,
  children,
}: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        {backTo && (
          <Link to={backTo.path} state={backTo.state} className="page-header__back">
            ← {backTo.label}
          </Link>
        )}
        <h1 className="page-header__title">{title}</h1>
        {subtitle && (
          <p className="page-header__subtitle">{subtitle}</p>
        )}
      </div>
      {children && (
        <div className="page-header__actions">{children}</div>
      )}
    </div>
  );
});