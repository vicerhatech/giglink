import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./auth-context";
import { validateLogin } from "./auth-form-utils";
import { AuthFormLayout, AuthField as Field, AuthPasswordField as PasswordField } from "./AuthFormLayout";

const initialValues = { email: "", password: "" };

function dashboardPathForRole(role) {
  if (role === "customer") return "/customer/dashboard";
  if (role === "talent") return "/talent/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/";
}

export function LoginPage({ onAuthenticated } = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, getErrorMessage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function updateField(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validateLogin(values);
    setErrors(validationErrors);
    setApiError("");
    if (Object.keys(validationErrors).length) return;

    setIsSubmitting(true);
    try {
      const user = await login(values);
      onAuthenticated?.();
      navigate(location.state?.from?.pathname || dashboardPathForRole(user.role), { replace: true });
    } catch (error) {
      setApiError(getErrorMessage(error, "Unable to sign in. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthFormLayout title="Welcome back." subtitle="Your next live moment is waiting. Sign in to your workspace.">
      <form className="auth-form" onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
        <Field label="Email" name="email" type="email" placeholder="you@example.com" value={values.email} onChange={updateField} error={errors.email} autoComplete="email" autoFocus />
        <PasswordField label="Password" name="password" value={values.password} onChange={updateField} error={errors.password} autoComplete="current-password" visible={showPassword} onToggle={() => setShowPassword((visible) => !visible)} />
        {apiError && <p role="alert" aria-live="assertive" className="auth-error">{apiError}</p>}
        <button type="submit" disabled={isSubmitting} className="auth-submit">
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="auth-switch">New to GigLink? <Link to="/register">Create an account</Link>.</p>
    </AuthFormLayout>
  );
}
