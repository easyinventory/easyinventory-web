import { memo } from "react";
import "./SuccessBanner.css";

interface SuccessBannerProps {
  message: string;
}

export default memo(function SuccessBanner({ message }: SuccessBannerProps) {
  return <div className="success-banner">{message}</div>;
});
