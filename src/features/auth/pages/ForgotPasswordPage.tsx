import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useAsyncAction } from "../../../shared/hooks";
import AuthLayout from "../../../shared/components/layout/AuthLayout";

function extractForgotPasswordError(err: unknown): string {
  if (err instanceof Error) {
    if (err.name === "UserNotFoundException") return "No account found with this email.";
    if (err.name === "LimitExceededException") return "Too many attempts. Please try again later.";
    return err.message;
  }
  return "An unexpected error occurred.";
}

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const action = useCallback(async () => {
    await forgotPassword(email);
    navigate("/reset-password", { state: { email } });
  }, [forgotPassword, email, navigate]);

  const { execute, isLoading: isSubmitting, error } = useAsyncAction(action, {
    extractError: extractForgotPasswordError,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void execute();
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