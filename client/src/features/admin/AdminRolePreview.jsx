import { useState } from "react";

const previews = {
  customer: { title: "Plan your next event", navigation: ["Dashboard", "Create Gig", "My Gigs", "Settings"], cards: [["Create a gig", "Describe the event, people needed and 1–3 audition requests."], ["Manage your gigs", "Draft → Pay posting fee → Published → Review applicants."]], note: "Free gig posting: ₦5,000. Paid gig posting: ₦10,000. Talent compensation is separate." },
  talent: { title: "Find your next performance", navigation: ["Dashboard", "Browse Gigs", "My Applications", "Profile", "Settings"], cards: [["Browse opportunities", "See eligible published gigs without exposing exact venue details."], ["Track applications", "Submit matching samples, follow decisions and reapply when eligible."]], note: "A ₦5,000 / 30-day pass is required for new Paid-gig discovery after the first accepted Paid gig. Accepted bookings remain accessible." },
};
export function AdminRolePreview() {
  const [role, setRole] = useState("customer");
  const preview = previews[role];
  return <section className="settings-extra"><p className="section-label">Role simulator</p><h2>Preview another workspace</h2><p>Read-only demonstration. You remain an Admin. No user is impersonated, no JWT or account role changes, and no real customer/talent action is performed.</p><div className="appearance-options">{Object.keys(previews).map(option => <button key={option} type="button" className="theme-choice" aria-pressed={role === option} onClick={() => setRole(option)}>{option === "customer" ? "Customer / Event host" : "Talent"}</button>)}</div><div className="admin-role-preview" aria-live="polite"><span className="section-label">{role} preview · sample content</span><h3>{preview.title}</h3><ul aria-label="Preview navigation">{preview.navigation.map(label => <li key={label}>{label}</li>)}</ul><div className="quick-actions">{preview.cards.map(([title, description]) => <article className="admin-stat" key={title}><h4>{title}</h4><p>{description}</p></article>)}</div><p>{preview.note}</p></div></section>;
}
