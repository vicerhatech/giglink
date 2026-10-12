import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./auth-context";
import { validateRegistration } from "./auth-form-utils";

const initialValues = { name: "", email: "", phone: "", password: "", role: "customer" };

export function RegisterPage() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      await register(values);
      navigate("/", { replace: true });
    } catch (error) {
      setApiError(getErrorMessage(error, "Unable to create your account. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12"><section className="w-full rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">GigLink</p><h1 className="mt-3 text-3xl font-bold text-slate-900">Create your account</h1><p className="mt-2 text-slate-600">Join as an event host or talent.</p><form className="mt-7 space-y-4" onSubmit={handleSubmit} noValidate><Field label="Full name" name="name" value={values.name} onChange={updateField} error={errors.name} autoComplete="name" /><Field label="Email" name="email" type="email" value={values.email} onChange={updateField} error={errors.email} autoComplete="email" /><Field label="Phone" name="phone" type="tel" value={values.phone} onChange={updateField} error={errors.phone} autoComplete="tel" /><Field label="Password" name="password" type="password" value={values.password} onChange={updateField} error={errors.password} autoComplete="new-password" /><label className="block text-sm font-medium text-slate-700">I am joining as<select name="role" value={values.role} onChange={updateField} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" aria-invalid={Boolean(errors.role)}><option value="customer">Customer / Event host</option><option value="talent">Talent</option></select>{errors.role && <span className="mt-1 block text-sm text-red-700">{errors.role}</span>}</label>{apiError && <p role="alert" className="text-sm text-red-700">{apiError}</p>}<button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? "Creating account…" : "Create account"}</button></form><p className="mt-5 text-sm text-slate-600">Already have an account? <Link className="font-semibold text-indigo-700" to="/login">Sign in</Link>.</p></section></main>
  );
}

function Field({ label, error, ...inputProps }) {
  return <label className="block text-sm font-medium text-slate-700">{label}<input {...inputProps} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" aria-invalid={Boolean(error)} />{error && <span className="mt-1 block text-sm text-red-700">{error}</span>}</label>;
}
