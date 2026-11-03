import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./auth-context";
import { validateLogin } from "./auth-form-utils";

const initialValues = { email: "", password: "" };

function dashboardPathForRole(role) {
  if (role === "customer") return "/customer/dashboard";
  if (role === "talent") return "/talent/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/";
}

export function LoginPage() {
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
      navigate(location.state?.from?.pathname || dashboardPathForRole(user.role), { replace: true });
    } catch (error) {
      setApiError(getErrorMessage(error, "Unable to sign in. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to manage your GigLink account.">
      <form className="space-y-4" onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
        <Field label="Email" name="email" type="email" placeholder="you@example.com" value={values.email} onChange={updateField} error={errors.email} autoComplete="email" />
        <PasswordField label="Password" name="password" value={values.password} onChange={updateField} error={errors.password} autoComplete="current-password" visible={showPassword} onToggle={() => setShowPassword((visible) => !visible)} />
        {apiError && <p role="alert" aria-live="assertive" className="text-sm text-red-700">{apiError}</p>}
        <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-5 text-sm text-slate-600">New to GigLink? <Link className="font-semibold text-indigo-700" to="/register">Create an account</Link>.</p>
    </AuthCard>
  );
}

function AuthCard({ title, subtitle, children }) {
  return <main className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12"><section className="w-full rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">GigLink</p><h1 className="mt-3 text-3xl font-bold text-slate-900">{title}</h1><p className="mt-2 text-slate-600">{subtitle}</p><div className="mt-7">{children}</div></section></main>;
}

function Field({ label, error, ...inputProps }) {
  return <label className="block text-sm font-medium text-slate-700">{label}<input {...inputProps} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" aria-invalid={Boolean(error)} />{error && <span className="mt-1 block text-sm text-red-700">{error}</span>}</label>;
}

function PasswordField({ label, error, visible, onToggle, ...inputProps }) {
  return <label className="block text-sm font-medium text-slate-700">{label}<span className="relative mt-1.5 block"><input {...inputProps} type={visible ? "text" : "password"} className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-16 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" aria-invalid={Boolean(error)} /><button className="absolute inset-y-0 right-1 px-3 text-sm font-semibold text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" type="button" onClick={onToggle} aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible}>{visible ? "Hide" : "Show"}</button></span>{error && <span className="mt-1 block text-sm text-red-700">{error}</span>}</label>;
}
