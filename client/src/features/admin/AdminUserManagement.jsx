import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

const ROLE_FILTERS = [
  { value: "", label: "All accounts" },
  { value: "customer", label: "Customers" },
  { value: "talent", label: "Talents" },
];

export function AdminUserManagement() {
  const [role, setRole] = useState("");
  const [users, setUsers] = useState([]);
  const [state, setState] = useState({ loading: true, error: "", success: "", updatingId: "" });

  useEffect(() => {
    let active = true;
    async function loadUsers() {
      setState((current) => ({ ...current, loading: true, error: "", success: "" }));
      try {
        const response = await api.get("/admin/users", { params: role ? { role } : undefined });
        if (active) setUsers(response.data.data.users || []);
      } catch (error) {
        if (active) setState((current) => ({ ...current, error: error.response?.data?.message || "Unable to load accounts." }));
      } finally {
        if (active) setState((current) => ({ ...current, loading: false }));
      }
    }
    loadUsers();
    return () => { active = false; };
  }, [role]);

  async function updateStatus(user) {
    const accountStatus = user.accountStatus === "active" ? "suspended" : "active";
    setState((current) => ({ ...current, updatingId: user._id, error: "", success: "" }));
    try {
      const response = await api.patch(`/admin/users/${user._id}/status`, { accountStatus });
      const updatedUser = response.data.data.user;
      setUsers((current) => current.map((item) => (item._id === updatedUser._id ? updatedUser : item)));
      setState((current) => ({ ...current, success: `${updatedUser.name}'s account is now ${updatedUser.accountStatus}.` }));
    } catch (error) {
      setState((current) => ({ ...current, error: error.response?.data?.message || "Unable to update account status." }));
    } finally {
      setState((current) => ({ ...current, updatingId: "" }));
    }
  }

  return (
    <section aria-labelledby="admin-user-management-title">
      <h1 id="admin-user-management-title">Account management</h1>
      <p>Review and manage Customer and Talent accounts.</p>
      <label htmlFor="admin-role-filter">Show</label>{" "}
      <select id="admin-role-filter" value={role} onChange={(event) => setRole(event.target.value)}>
        {ROLE_FILTERS.map((filter) => <option key={filter.value} value={filter.value}>{filter.label}</option>)}
      </select>
      {state.loading && <p>Loading accounts…</p>}
      {state.error && <p role="alert">{state.error}</p>}
      {state.success && <p role="status">{state.success}</p>}
      {!state.loading && !state.error && users.length === 0 && <p>No matching accounts found.</p>}
      {!state.loading && users.length > 0 && (
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td><td>{user.email}</td><td>{user.role === "customer" ? "Customer" : "Talent"}</td><td>{user.accountStatus}</td>
                <td><button type="button" onClick={() => updateStatus(user)} disabled={state.updatingId === user._id}>
                  {state.updatingId === user._id ? "Saving…" : user.accountStatus === "active" ? "Suspend" : "Reactivate"}
                </button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
