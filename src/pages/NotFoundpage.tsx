import { Link } from "react-router-dom";
import "./NotFoundPage.css";

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <h1 className="not-found__code">404</h1>
      <p className="not-found__message">Page not found</p>
      <Link to="/">Back to dashboard</Link>
    </div>
  );
}