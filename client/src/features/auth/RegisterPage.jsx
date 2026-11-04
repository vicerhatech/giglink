import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "./auth-context";
import { validateRegistration } from "./auth-form-utils";
import { AuthFormLayout, AuthField, AuthPasswordField } from "./AuthFormLayout";

export function RegisterPage({ initialRole, onAuthenticated } = {}) {
  const [searchParams] = useSearchParams();
  const requestedRole = initialRole ?? searchParams.get("role");
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
      onAuthenticated?.();
      navigate(user.role === "customer" ? "/customer/dashboard" : user.role === "talent" ? "/talent/dashboard" : "/", { replace: true });
    } catch (error) {
      setApiError(getErrorMessage(error, "Unable to create your account. Please try again."));
    } finally { setIsSubmitting(false); }
  }
  return <AuthFormLayout title="Find your place in the lineup." subtitle="Join as an event host or talent. Start with a few details.">
    <form className="auth-form" onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
      <AuthField label="Full name" name="name" placeholder="Your full name" value={values.name} onChange={updateField} error={errors.name} autoComplete="name" autoFocus />
      <AuthField label="Email" name="email" type="email" placeholder="you@example.com" value={values.email} onChange={updateField} error={errors.email} autoComplete="email" />
      <AuthField label="Phone" name="phone" type="tel" placeholder="0800 000 0000" value={values.phone} onChange={updateField} error={errors.phone} autoComplete="tel" />
      <AuthPasswordField name="password" placeholder="Create a secure password" value={values.password} onChange={updateField} error={errors.password} autoComplete="new-password" visible={showPassword} onToggle={() => setShowPassword((visible) => !visible)} />
      <label className="auth-field"><span>I am joining as</span><select name="role" value={values.role} onChange={updateField} aria-invalid={Boolean(errors.role)} aria-describedby={errors.role ? "auth-role-error" : undefined}><option value="customer">Customer / Event host</option><option value="talent">Talent</option></select>{errors.role && <span className="auth-field-error" id="auth-role-error">{errors.role}</span>}</label>
      {apiError && <p role="alert" aria-live="assertive" className="auth-error">{apiError}</p>}
      <button type="submit" disabled={isSubmitting} className="auth-submit">{isSubmitting ? "Creating account…" : "Create account"}</button>
    </form>
    <p className="auth-switch">Already part of GigLink? <Link to="/login">Sign in</Link>.</p>
  </AuthFormLayout>;
}
