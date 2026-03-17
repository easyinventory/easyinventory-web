import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import AuthLayout from "../components/layout/AuthLayout";

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
    <AuthLayout>
      <div className="auth-card">
        <h1 className="auth-card__title">Reset password</h1>
        <p className="auth-card__subtitle">
          Enter your email and we'll send you a verification code.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-form__error">{error}</div>}

          <div className="auth-form__field">
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
            className="auth-form__submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending code..." : "Send verification code"}
          </button>

          <Link to="/login" className="auth-form__link">
            Back to sign in
          </Link>
        </form>
      </div>
    </AuthLayout>
  );
}