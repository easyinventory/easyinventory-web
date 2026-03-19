import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import AuthLayout from "../../../shared/components/layout/AuthLayout";

export default function LoginPage() {
  const {
    login,
    isAuthenticated,
    error: authError,
    needsNewPassword,
    completeNewPassword,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Already fully authenticated — redirect
  if (isAuthenticated && !needsNewPassword) {
    navigate(from, { replace: true });
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);

    try {
      await login(email, password);
      // If needsNewPassword is now true, don't navigate — the form
      // will swap to the new password view automatically
      if (!needsNewPassword) {
        navigate(from, { replace: true });
      }
    } catch {
      // Error handled by authError from context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (newPassword !== confirmPwd) {
      setLocalError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setLocalError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await completeNewPassword(newPassword);
      navigate(from, { replace: true });
    } catch {
      // Error handled by authError from context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        {needsNewPassword ? (
          <>
            <h1 className="auth-card__title">Set new password</h1>
            <p className="auth-card__subtitle">
              Your temporary password has expired. Choose a new password to
              continue.
            </p>

            <form className="auth-form" onSubmit={handleNewPassword}>
              {(authError || localError) && (
                <div className="auth-form__error">
                  {localError || authError}
                </div>
              )}

              <div className="auth-form__field">
                <label htmlFor="newPassword">New password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  autoFocus
                />
                <p className="auth-form__hint">
                  Must include uppercase, lowercase, number, and special
                  character.
                </p>
              </div>

              <div className="auth-form__field">
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
                className="auth-form__submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Setting password..." : "Set password & sign in"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="auth-card__title">Welcome back</h1>
            <p className="auth-card__subtitle">
              Sign in to manage your inventory
            </p>

            <form className="auth-form" onSubmit={handleLogin}>
              {authError && (
                <div className="auth-form__error">{authError}</div>
              )}

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

              <div className="auth-form__field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <Link
                to="/forgot-password"
                className="auth-form__link auth-form__link--forgot"
              >
                Forgot password?
              </Link>

              <button
                type="submit"
                className="auth-form__submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </>
        )}
      </div>
    </AuthLayout>
  );
}