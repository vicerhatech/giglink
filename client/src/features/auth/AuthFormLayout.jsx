import { useId } from "react";
import "./auth-dialog.css";

export function AuthFormLayout({ title, subtitle, children }) {
  return <section className="auth-form-card"><div className="auth-brand"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>GigLink</div><h1 id="auth-dialog-title">{title}</h1><p className="auth-subtitle">{subtitle}</p>{children}</section>;
}

export function AuthField({ label, error, ...props }) {
  const id = useId();
  return <label className="auth-field" htmlFor={id}><span>{label}</span><input {...props} id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} />{error && <span className="auth-field-error" id={`${id}-error`}>{error}</span>}</label>;
}

export function AuthPasswordField({ label = "Password", error, visible, onToggle, ...props }) {
  const id = useId();
  return <div className="auth-field"><label htmlFor={id}>{label}</label><div className="auth-password"><input {...props} id={id} type={visible ? "text" : "password"} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} /><button type="button" onClick={onToggle} aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible}>{visible ? "Hide" : "Show"}</button></div>{error && <span className="auth-field-error" id={`${id}-error`}>{error}</span>}</div>;
}
