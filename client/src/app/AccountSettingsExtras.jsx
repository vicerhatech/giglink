import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/routes";
import { api } from "../lib/api";
import { useTheme, THEMES } from "./ThemeProvider";
import { SubscriptionSettings } from "../features/payments/SubscriptionSettings";

export function AccountSettingsExtras() {
  const { user, logout } = useAuth();
  const { mode, theme, setMode, setTheme } = useTheme();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  async function remove(event) {
    event.preventDefault();
    if (!window.confirm("Permanently delete your account and profile? This cannot be undone. Your gigs will be cancelled and pending applications withdrawn or closed. Booking/payment history and existing provider media may remain. No refund is issued.")) return;
    setBusy(true); setError("");
    try { await api.delete("/users/me", { data: { password, confirmation }, timeout: 20000 }); logout(); navigate("/", { replace: true }); }
    catch (error) { setError(error.response?.data?.message || "Account deletion failed. Your account has not been deleted."); }
    finally { setBusy(false); }
  }
  return <><section className="settings-extra"><h2>Make GigLink yours</h2><p>Your appearance preferences apply across the app and are saved on this device.</p><h3>Display mode</h3><div className="appearance-options">{["light", "dark", "system"].map(option => <button key={option} className="theme-choice" type="button" aria-pressed={mode === option} onClick={() => setMode(option)}>{option[0].toUpperCase() + option.slice(1)}</button>)}</div><h3>Colour theme</h3><div className="appearance-options">{THEMES.map(option => <button key={option.id} className="theme-choice" type="button" aria-pressed={theme === option.id} onClick={() => setTheme(option.id)}><span className="theme-swatch" style={{ background: option.color }} />{option.name}</button>)}</div></section>{user.role === "talent" && <SubscriptionSettings />}<section className="settings-extra danger-zone"><h2>Delete account</h2>{user.role === "admin" ? <p>Admin accounts cannot be deleted through self-service to prevent accidental lockout.</p> : <details><summary>Permanently delete my account</summary><p>This removes your sign-in and Talent Profile. Your open gigs will be cancelled and pending applications closed. Historical booking/payment records and provider media are not erased. Upcoming accepted bookings must be resolved first.</p><form onSubmit={remove}><label>Current password<input type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required disabled={busy} /></label><label>Type DELETE to confirm<input value={confirmation} onChange={event => setConfirmation(event.target.value)} required pattern="DELETE" disabled={busy} /></label>{error && <p role="alert">{error}</p>}<button className="danger-action" disabled={busy || confirmation !== "DELETE" || !password} type="submit">{busy ? "Deleting…" : "Delete account permanently"}</button></form></details>}</section></>;
}
