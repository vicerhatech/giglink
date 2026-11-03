import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "./auth-context";
import { validateRegistration } from "./auth-form-utils";

function dashboardPathForRole(role) {
  if (role === "customer") return "/customer/dashboard";
  if (role === "talent") return "/talent/dashboard";
  return "/";
}

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const requestedRole = searchParams.get("role");
  const [values, setValues] = useState(() => ({ name: "", email: "", phone: "", password: "", role: requestedRole === "talent" ? "talent" : "customer" }));
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, getErrorMessage } = useAuth();
  const navigate = useNavigate();

  function updateField(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validateRegistration(values);
    setErrors(validationErrors);
    setApiError("");
    if (Object.keys(validationErrors).length) return;

    setIsSubmitting(true);
    try {
      const user = await register(values);
      navigate(dashboardPathForRole(user.role), { replace: true });
    } catch (error) {
      setApiError(getErrorMessage(error, "Unable to create your account. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12"><section className="w-full rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">GigLink</p><h1 className="mt-3 text-3xl font-bold text-slate-900">Create your account</h1><p className="mt-2 text-slate-600">Join as an event host or talent.</p><form className="mt-7 space-y-4" onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}><Field label="Full name" name="name" placeholder="Your full name" value={values.name} onChange={updateField} error={errors.name} autoComplete="name" /><Field label="Email" name="email" type="email" placeholder="you@example.com" value={values.email} onChange={updateField} error={errors.email} autoComplete="email" /><Field label="Phone" name="phone" type="tel" placeholder="0800 000 0000" value={values.phone} onChange={updateField} error={errors.phone} autoComplete="tel" /><PasswordField label="Password" name="password" placeholder="Create a secure password" value={values.password} onChange={updateField} error={errors.password} autoComplete="new-password" visible={showPassword} onToggle={() => setShowPassword((visible) => !visible)} /><label className="block text-sm font-medium text-slate-700">I am joining as<select name="role" value={values.role} onChange={updateField} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" aria-invalid={Boolean(errors.role)}><option value="customer">Customer / Event host</option><option value="talent">Talent</option></select>{errors.role && <span className="mt-1 block text-sm text-red-700">{errors.role}</span>}</label>{apiError && <p role="alert" aria-live="assertive" className="text-sm text-red-700">{apiError}</p>}<button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? "Creating account…" : "Create account"}</button></form><p className="mt-5 text-sm text-slate-600">Already have an account? <Link className="font-semibold text-indigo-700" to="/login">Sign in</Link>.</p></section></main>
  );
}

function Field({ label, error, ...inputProps }) {
  return <label className="block text-sm font-medium text-slate-700">{label}<input {...inputProps} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" aria-invalid={Boolean(error)} />{error && <span className="mt-1 block text-sm text-red-700">{error}</span>}</label>;
}

function PasswordField({ label, error, visible, onToggle, ...inputProps }) {
  return <label className="block text-sm font-medium text-slate-700">{label}<span className="relative mt-1.5 block"><input {...inputProps} type={visible ? "text" : "password"} className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-16 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" aria-invalid={Boolean(error)} /><button className="absolute inset-y-0 right-1 px-3 text-sm font-semibold text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" type="button" onClick={onToggle} aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible}>{visible ? "Hide" : "Show"}</button></span>{error && <span className="mt-1 block text-sm text-red-700">{error}</span>}</label>;
}
