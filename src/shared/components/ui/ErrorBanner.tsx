import { memo } from "react";
import "./ErrorBanner.css";

interface ErrorBannerProps {
  message: string;
}

export default memo(function ErrorBanner({ message }: ErrorBannerProps) {
  return <div className="error-banner">{message}</div>;
});
