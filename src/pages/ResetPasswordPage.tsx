import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import "./ResetPasswordPage.css";

export default function ResetPasswordPage() {
  const { confirmResetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Email passed from ForgotPasswordPage via router state
  const emailFromState = (location.state as { email?: string })?.email || "";

  const [email, setEmail] = useState(emailFromState);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (newPassword !== confirmPwd) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      await confirmResetPassword(email, code, newPassword);
      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "CodeMismatchException") {
          setError("Invalid verification code. Please check and try again.");
        } else if (err.name === "LimitExceededException") {
          setError("Too many attempts. Please request a new code.");
        } else if (err.name === "InvalidPasswordException") {
          setError(
            "Password must include uppercase, lowercase, a number, and a special character."
          );
        } else if (err.name === "ExpiredCodeException") {
          setError("Verification code has expired. Please request a new one.");
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
    <div className="reset-page">
      <div className="reset-card">
        <h1 className="reset-card__title">Set new password</h1>
        <p className="reset-card__subtitle">
          Enter the verification code sent to your email and choose a new
          password.
        </p>

        <form className="reset-form" onSubmit={handleSubmit}>
          {error && <div className="reset-form__error">{error}</div>}
          {success && (
            <div className="reset-form__success">
              Password reset successfully! Redirecting to sign in...
            </div>
          )}

          {!success && (
            <>
              <div className="reset-form__field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                />
              </div>

              <div className="reset-form__field">
                <label htmlFor="code">Verification code</label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  required
                  autoFocus
                  autoComplete="one-time-code"
                  inputMode="numeric"
                />
                <p className="reset-form__hint">
                  Check your email for a 6-digit code from Cognito.
                </p>
              </div>

              <div className="reset-form__field">
                <label htmlFor="newPassword">New password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                />
                <p className="reset-form__hint">
                  Must include uppercase, lowercase, number, and special
                  character.
                </p>
              </div>

              <div className="reset-form__field">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  minLength={8}
                />
              </div>

              <button
                type="submit"
                className="reset-form__submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Resetting..." : "Reset password"}
              </button>
            </>
          )}

          <Link to="/login" className="reset-form__back">
            Back to sign in
          </Link>
        </form>
      </div>
    </div>
  );
}