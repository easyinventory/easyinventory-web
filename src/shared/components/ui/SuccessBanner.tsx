import "./SuccessBanner.css";

interface SuccessBannerProps {
  message: string;
}

export default function SuccessBanner({ message }: SuccessBannerProps) {
  return <div className="success-banner">{message}</div>;
}
