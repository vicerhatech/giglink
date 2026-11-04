import { useEffect, useRef, useState } from "react";
import { api } from "../../lib/api.js";
import "./admin.css";

export function AdminUserManagement() {
  const [role, setRole] = useState("");
  const [users, setUsers] = useState([]);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ loading: true, error: "", success: "", updatingId: "" });
  const [selected, setSelected] = useState(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    setState(current => ({ ...current, loading: true, error: "", success: "" }));
    api.get("/admin/users", { params: role ? { role } : undefined, signal: controller.signal, timeout: 15000 })
      .then(response => { if (!controller.signal.aborted) setUsers(response.data.data.users || []); })
      .catch(error => { if (!controller.signal.aborted) setState(current => ({ ...current, error: error.response?.data?.message || "Unable to load accounts. Please try again." })); })
      .finally(() => { if (!controller.signal.aborted) setState(current => ({ ...current, loading: false })); });
    return () => controller.abort();
  }, [role, attempt]);

  useEffect(() => {
    if (selected && !dialogRef.current?.open) dialogRef.current?.showModal();
    if (!selected && dialogRef.current?.open) dialogRef.current.close();
  }, [selected]);

  async function updateStatus() {
    if (!selected || state.updatingId) return;
    const user = selected;
    const accountStatus = user.accountStatus === "active" ? "suspended" : "active";
    setState(current => ({ ...current, updatingId: user._id, error: "", success: "" }));
    try {
      const response = await api.patch(`/admin/users/${user._id}/status`, { accountStatus }, { timeout: 15000 });
      const updated = response.data.data.user;
      setUsers(current => current.map(item => item._id === updated._id ? updated : item));
      setState(current => ({ ...current, success: `${updated.name}'s account is now ${updated.accountStatus}.` }));
    } catch (error) {
      setState(current => ({ ...current, error: error.response?.data?.message || "Unable to update account status. Please try again." }));
    } finally {
      setSelected(null);
      setState(current => ({ ...current, updatingId: "" }));
    }
  }

  return <section className="admin-users-page" aria-labelledby="admin-user-management-title">
    <header className="admin-users-heading"><div><p className="section-label">Administration</p><h1 id="admin-user-management-title">User management</h1><p>Review accounts and control access to GigLink.</p></div><span className="admin-account-count">{state.loading ? "Loading…" : `${users.length} ${users.length === 1 ? "account" : "accounts"}`}</span></header>
    <div className="admin-users-panel">
      <div className="admin-users-toolbar"><label htmlFor="admin-role-filter">Account type<select id="admin-role-filter" value={role} onChange={event => setRole(event.target.value)} disabled={Boolean(state.updatingId)}><option value="">All accounts</option><option value="customer">Customers / Event hosts</option><option value="talent">Talents</option></select></label><p>Suspending blocks sign-in and existing sessions. Reactivate to restore access.</p></div>
      {state.error && <div className="admin-feedback error" role="alert">{state.error} <button type="button" onClick={() => setAttempt(value => value + 1)} disabled={state.loading || Boolean(state.updatingId)}>Reload accounts</button></div>}
      {state.success && <p className="admin-feedback success" role="status">{state.success}</p>}
      {state.loading ? <p className="admin-list-state" role="status">Loading accounts…</p> : state.error && users.length === 0 ? null : users.length === 0 ? <div className="admin-list-state"><h2>No matching accounts</h2><p>Choose another account type to see more users.</p></div> : <div className="admin-table-scroll" tabIndex="0" role="region" aria-label="User accounts table">
        <table className="admin-user-table"><caption className="sr-only">Customer and Talent accounts with account access controls</caption><thead><tr><th scope="col">Account</th><th scope="col">Role</th><th scope="col">Status</th><th scope="col">Manage access</th></tr></thead><tbody>{users.map(user => <tr key={user._id}>
          <td><div className="admin-account-cell"><span className="admin-account-avatar" aria-hidden="true">{user.name?.trim()?.slice(0, 1).toUpperCase() || "?"}</span><div><strong>{user.name}</strong><span>{user.email}</span></div></div></td>
          <td><span className="admin-role-label">{user.role === "customer" ? "Customer" : "Talent"}</span></td>
          <td><span className={`admin-status-badge ${user.accountStatus}`}><i aria-hidden="true" />{user.accountStatus === "active" ? "Active" : "Suspended"}</span></td>
          <td><button className={`admin-status-action ${user.accountStatus === "active" ? "suspend" : "reactivate"}`} type="button" onClick={() => setSelected(user)} disabled={Boolean(state.updatingId)} aria-label={`${user.accountStatus === "active" ? "Suspend" : "Reactivate"} ${user.name}`}>{state.updatingId === user._id ? "Saving…" : user.accountStatus === "active" ? "Suspend" : "Reactivate"}</button></td>
        </tr>)}</tbody></table>
      </div>}
    </div>
    <dialog className="admin-confirm-dialog" ref={dialogRef} aria-labelledby="admin-confirm-title" onCancel={event => { if (state.updatingId) event.preventDefault(); else setSelected(null); }}>
      {selected && <><p className="section-label">Confirm account action</p><h2 id="admin-confirm-title">{selected.accountStatus === "active" ? "Suspend" : "Reactivate"} {selected.name}?</h2><p>{selected.accountStatus === "active" ? "This person will be unable to sign in or use an existing session. Their account data will remain, and you can reactivate them later." : "This person will be able to sign in and use their account again."}</p><div className="admin-confirm-actions"><button className="admin-status-action" type="button" disabled={Boolean(state.updatingId)} onClick={() => setSelected(null)}>Cancel</button><button className={`admin-status-action ${selected.accountStatus === "active" ? "suspend" : "reactivate"}`} type="button" onClick={updateStatus} disabled={Boolean(state.updatingId)}>{state.updatingId ? "Saving…" : selected.accountStatus === "active" ? "Confirm suspension" : "Confirm reactivation"}</button></div></>}
    </dialog>
  </section>;
}
