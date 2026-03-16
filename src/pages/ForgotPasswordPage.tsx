import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import "./ForgotPasswordPage.css";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await forgotPassword(email);
      // Navigate to reset page, pass email via router state
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "UserNotFoundException") {
          setError("No account found with this email.");
        } else if (err.name === "LimitExceededException") {
          setError("Too many attempts. Please try again later.");
        } else {
          setError(err.message);
        }
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-card">
        <h1 className="forgot-card__title">Reset password</h1>
        <p className="forgot-card__subtitle">
          Enter your email and we'll send you a verification code.
        </p>

        <form className="forgot-form" onSubmit={handleSubmit}>
          {error && <div className="forgot-form__error">{error}</div>}

          <div className="forgot-form__field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="forgot-form__submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending code..." : "Send verification code"}
          </button>

          <Link to="/login" className="forgot-form__back">
            Back to sign in
          </Link>
        </form>
      </div>
    </div>
  );
}