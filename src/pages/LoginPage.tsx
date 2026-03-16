import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import "./LoginPage.css";

export default function LoginPage() {
  const { login, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to dashboard
  if (isAuthenticated) {
    navigate("/", { replace: true });
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch {
      // Error is already set in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-card__title">EasyInventory</h1>
        <p className="login-card__subtitle">
          Sign in to manage your inventory
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-field__label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="form-field__input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              autoFocus
            />
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="form-field__input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="login-form__error">{error}</div>
          )}

          <button
            type="submit"
            className="login-form__submit"
            disabled={isSubmitting || !email || !password}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}