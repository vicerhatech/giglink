import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/routes";
import "./settings.css";

function labelForRole(role) {
  if (!role) return "Not available";
  return role.replace(/_/g, " ").replace(/^./, (letter) => letter.toUpperCase());
}

function AccountDetail({ label, value }) {
  return <div className="account-detail"><dt>{label}</dt><dd>{value || "Not provided"}</dd></div>;
}

export function SettingsPage() {
  const { user, isLoading, updateAccount, getErrorMessage } = useAuth();
  const [values, setValues] = useState({ name: "", phone: "" });
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValues({ name: user?.name || "", phone: user?.phone || "" });
  }, [user]);

  if (isLoading) return <main className="settings-page"><p className="settings-state" role="status">Loading your account…</p></main>;
  if (!user) return <main className="settings-page"><section className="settings-state"><h1>Account settings</h1><p>Sign in to view and update your account details.</p><Link className="button button-primary" to="/login">Sign in</Link></section></main>;

  const update = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError("");
    if (event.target.name === "name") setNameError("");
    setSuccess("");
  };

  async function submit(event) {
    event.preventDefault();
    const name = values.name.trim();
    if (!name) {
      setNameError("Enter your name before saving.");
      return;
    }
    setSaving(true);
    setError("");
    setNameError("");
    setSuccess("");
    try {
      await updateAccount({ name, phone: values.phone.trim() });
      setSuccess("Your account details have been saved.");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "We could not update your account."));
    } finally {
      setSaving(false);
    }
  }

  const accountStatus = user.accountStatus || user.status;
  return <main className="settings-page"><header className="settings-heading"><p>Account</p><h1>Settings</h1><span>Review the details connected to your GigLink account.</span></header><div className="settings-grid"><section className="settings-card"><div><p className="section-label">Account details</p><h2>Your information</h2><p className="settings-copy">Email is read-only because GigLink does not currently offer a change-email flow.</p></div><form className="settings-form" onSubmit={submit} noValidate aria-busy={saving}><div className="settings-field"><label htmlFor="settings-name">Name</label><input id="settings-name" name="name" type="text" autoComplete="name" placeholder="Your full name" value={values.name} onChange={update} aria-invalid={Boolean(nameError)} aria-describedby={nameError ? "settings-name-error" : undefined} disabled={saving} required />{nameError && <p className="settings-error" id="settings-name-error" role="alert">{nameError}</p>}</div><div className="settings-field"><label htmlFor="settings-email">Email address</label><input id="settings-email" type="email" value={user.email || ""} readOnly aria-readonly="true" /></div><div className="settings-field"><label htmlFor="settings-phone">Phone number <span>(optional)</span></label><input id="settings-phone" name="phone" type="tel" autoComplete="tel" placeholder="0800 000 0000" value={values.phone} onChange={update} disabled={saving} /></div>{error && <p className="settings-error" id="settings-error" role="alert">{error}</p>}{success && <p className="settings-success" role="status">{success}</p>}<button className="button button-primary settings-submit" type="submit" disabled={saving}>{saving ? "Saving changes…" : "Save changes"}</button></form></section><aside className="settings-summary"><p className="section-label">Account summary</p><dl><AccountDetail label="Role" value={labelForRole(user.role)} />{accountStatus && <AccountDetail label="Account status" value={labelForRole(accountStatus)} />}<AccountDetail label="Email" value={user.email} /><AccountDetail label="Phone" value={user.phone} /></dl>{user.role === "talent" && <p className="settings-talent-note">Talent profile details and profile images are managed separately in <Link to="/talent/profile">your profile</Link>.</p>}</aside></div></main>;
}
